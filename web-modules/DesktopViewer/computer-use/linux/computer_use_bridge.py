#!/usr/bin/python3
"""Linux Computer Use protocol boundary: AT-SPI, consented portal input and PipeWire."""
import base64
import fcntl
import json
import os
import stat
import sys
import threading
import time
import uuid
import gi

gi.require_version('Atspi', '2.0')
gi.require_version('Gst', '1.0')
from gi.repository import Atspi, Gio, GLib, Gst

Gst.init(None)


class NativeError(RuntimeError):
	def __init__(self, code, message):
		super().__init__(message)
		self.code = code


class GrantStore:
	"""Private per-user grant state, outside replaceable package directories."""
	APP_ID = 'com.buffaly.ComputerUse'
	DESKTOP = ('[Desktop Entry]\nType=Application\nName=Buffaly Computer Use\n'
		'Comment=Consented desktop capture and input for Buffaly\n'
		'Exec=/usr/bin/true\nTryExec=/usr/bin/true\nNoDisplay=true\nTerminal=false\n')

	def __init__(self):
		self.lock = None
		base = os.environ.get('XDG_STATE_HOME', os.path.expanduser('~/.local/state'))
		self.root = os.path.join(base, 'buffaly', 'computer-use')
		self.directory(self.root, private=True)

	@staticmethod
	def directory(path, private=False):
		# Reject symlink ancestors and writable-by-other directories, not just leaf files.
		if not os.path.isabs(path):
			raise NativeError('portal_state_invalid', 'XDG directories must be absolute.')
		current = '/'
		for part in path.split('/')[1:]:
			if not part or part in ('.', '..'):
				raise NativeError('portal_state_invalid', 'XDG directory path is not canonical.')
			current = os.path.join(current, part)
			try:
				os.mkdir(current, 0o700)
			except FileExistsError:
				pass
			info = os.lstat(current)
			if not stat.S_ISDIR(info.st_mode) or info.st_uid not in (0, os.getuid()) or info.st_mode & 0o022:
				raise NativeError('portal_state_invalid', 'Unsafe XDG directory ownership, mode or symlink.')
		info = os.lstat(path)
		if info.st_uid != os.getuid() or (private and stat.S_IMODE(info.st_mode) != 0o700):
			raise NativeError('portal_state_invalid', 'Private grant directory must be user-owned mode 0700.')

	def read(self, name):
		try:
			fd = os.open(os.path.join(self.root, name), os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
		except FileNotFoundError:
			return None
		with os.fdopen(fd) as source:
			info = os.fstat(source.fileno())
			if not stat.S_ISREG(info.st_mode) or info.st_uid != os.getuid() or stat.S_IMODE(info.st_mode) != 0o600 or info.st_nlink != 1 or info.st_size > 4096:
				raise NativeError('portal_state_invalid', 'Grant files must be bounded private regular user-owned mode 0600 files.')
			try:
				value = json.load(source)
			except (ValueError, UnicodeError):
				raise NativeError('portal_state_invalid', 'Invalid grant state document.') from None
			if not isinstance(value, dict):
				raise NativeError('portal_state_invalid', 'Grant state must be an object.')
			return value

	def write(self, name, value):
		# Validate before atomic replacement; fsync both file and directory for durable consumption.
		self.read(name)
		path = os.path.join(self.root, name)
		temporary = path + '.' + uuid.uuid4().hex
		try:
			fd = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
			with os.fdopen(fd, 'w') as output:
				json.dump(value, output)
				output.flush()
				os.fsync(output.fileno())
			os.replace(temporary, path)
			self.sync()
		finally:
			if os.path.exists(temporary):
				os.unlink(temporary)

	def sync(self):
		fd = os.open(self.root, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
		try:
			os.fsync(fd)
		finally:
			os.close(fd)

	def acquire(self):
		if self.lock is not None:
			return
		fd = os.open(os.path.join(self.root, 'grant.lock'), os.O_RDWR | os.O_CREAT | os.O_NOFOLLOW, 0o600)
		try:
			info = os.fstat(fd)
			if not stat.S_ISREG(info.st_mode) or info.st_uid != os.getuid() or stat.S_IMODE(info.st_mode) != 0o600 or info.st_nlink != 1:
				raise NativeError('portal_state_invalid', 'Unsafe grant lock file.')
			try:
				fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
			except BlockingIOError:
				raise NativeError('portal_grant_busy', 'Another owned bridge holds the grant; close it before reconnecting.') from None
			self.lock = fd
		except Exception:
			os.close(fd)
			raise

	def release(self):
		if self.lock is not None:
			fd = self.lock
			self.lock = None
			os.close(fd)

	def install_identity(self):
		base = os.environ.get('XDG_DATA_HOME', os.path.expanduser('~/.local/share'))
		folder = os.path.join(base, 'applications')
		self.directory(folder)
		path = os.path.join(folder, self.APP_ID + '.desktop')
		try:
			fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
		except FileNotFoundError:
			fd = None
		if fd is not None:
			with os.fdopen(fd) as source:
				info = os.fstat(source.fileno())
				if not stat.S_ISREG(info.st_mode) or info.st_uid != os.getuid() or stat.S_IMODE(info.st_mode) != 0o600 or info.st_nlink != 1 or source.read(4096) != self.DESKTOP:
					raise NativeError('portal_identity_conflict', 'Existing desktop identity conflicts with private package-owned Buffaly metadata.')
			return
		temporary = path + '.' + uuid.uuid4().hex
		try:
			fd = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
			with os.fdopen(fd, 'w') as output:
				output.write(self.DESKTOP)
				output.flush()
				os.fsync(output.fileno())
			# No-clobber atomic publish. Never overwrite unrelated application metadata.
			os.link(temporary, path, follow_symlinks=False)
			fd = os.open(folder, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
			try:
				os.fsync(fd)
			finally:
				os.close(fd)
		finally:
			os.unlink(temporary)

	def grant(self):
		value = self.read('grant.json')
		if value is None:
			return {'SchemaVersion': 1, 'AppId': self.APP_ID, 'Status': 'regrant_required', 'Generation': 0}
		if set(value) - {'SchemaVersion', 'AppId', 'Status', 'Generation', 'Token'} or value.get('SchemaVersion') != 1 or value.get('AppId') != self.APP_ID or value.get('Status') not in ('ready', 'consumed', 'regrant_required') or type(value.get('Generation')) is not int or value['Generation'] < 0:
			raise NativeError('portal_state_invalid', 'Grant document does not match the required schema.')
		if value['Status'] == 'ready':
			self.validate_token(value.get('Token'))
		elif 'Token' in value:
			raise NativeError('portal_state_invalid', 'Non-ready grant must not retain a consumed token.')
		return value

	@staticmethod
	def validate_token(token):
		try:
			if not isinstance(token, str) or str(uuid.UUID(token)) != token:
				raise ValueError()
		except (ValueError, AttributeError):
			raise NativeError('portal_state_invalid', 'Invalid opaque restore token.') from None

	def authorize(self):
		# Explicit CLI operation; five minutes, consumed even on denied/timed-out requests.
		self.acquire()
		try:
			self.write('authorize.json', {'SchemaVersion': 1, 'AppId': self.APP_ID, 'ExpiresUtc': int(time.time()) + 300})
		finally:
			self.release()

	def consume_authorization(self):
		value = self.read('authorize.json')
		if value is None:
			return False
		os.unlink(os.path.join(self.root, 'authorize.json'))
		self.sync()
		if set(value) != {'SchemaVersion', 'AppId', 'ExpiresUtc'} or value['SchemaVersion'] != 1 or value['AppId'] != self.APP_ID or type(value['ExpiresUtc']) is not int:
			raise NativeError('portal_state_invalid', 'Invalid one-use consent authorization.')
		now = int(time.time())
		return now <= value['ExpiresUtc'] <= now + 300


class Desktop:
	def __init__(self):
		self.bus = Gio.bus_get_sync(Gio.BusType.SESSION, None)
		self.windows = {}
		self.elements = {}
		self.session = None
		self.stream = None
		self.fd = None
		self.pipeline = None
		self.store = None
		self.portal_owner = None
		self.loop = GLib.MainLoop()
		threading.Thread(target=self.loop.run, daemon=True).start()

	def call(self, interface, method, signature, args, path='/org/freedesktop/portal/desktop'):
		return self.bus.call_sync(self.portal_owner, path, interface, method,
			GLib.Variant(signature, args), None, Gio.DBusCallFlags.NONE, 15000, None)

	def request(self, interface, method, signature, args):
		# Subscribe before issuing a request: portal responses can precede the method reply.
		token = 'buffaly' + uuid.uuid4().hex
		args[-1]['handle_token'] = GLib.Variant('s', token)
		owner = self.bus.get_unique_name()[1:].replace('.', '_')
		path = '/org/freedesktop/portal/desktop/request/' + owner + '/' + token
		ready = threading.Event()
		result = []
		def response(bus, sender, object_path, iface, signal, parameters):
			result.append(parameters.unpack())
			ready.set()
		sub = self.bus.signal_subscribe(self.portal_owner,
			'org.freedesktop.portal.Request', 'Response', path, None, Gio.DBusSignalFlags.NONE, response)
		try:
			self.call(interface, method, signature, tuple(args))
			if not ready.wait(90):
				try:
					self.bus.call_sync(self.portal_owner, path,
						'org.freedesktop.portal.Request', 'Close', None, None, Gio.DBusCallFlags.NONE, 5000, None)
				except GLib.Error:
					pass
				raise NativeError('portal_consent_required', 'Desktop sharing dialog was not approved within 90 seconds.')
			code, values = result[0]
			if code != 0:
				raise NativeError('portal_permission_denied', 'Desktop sharing request was cancelled or denied (' + str(code) + ').')
			return values
		finally:
			self.bus.signal_unsubscribe(sub)

	def register_identity(self):
		# Register before any portal method, once per frontend owner (also after service restart).
		self.bus.call_sync('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus',
			'StartServiceByName', GLib.Variant('(su)', ('org.freedesktop.portal.Desktop', 0)), None,
			Gio.DBusCallFlags.NONE, 15000, None)
		owner = self.bus.call_sync('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus',
			'GetNameOwner', GLib.Variant('(s)', ('org.freedesktop.portal.Desktop',)), None,
			Gio.DBusCallFlags.NONE, 15000, None).unpack()[0]
		if self.portal_owner == owner:
			return
		self.reset_capture()
		self.elements = {}
		self.observed_target = None
		self.store.install_identity()
		try:
			self.bus.call_sync(owner, '/org/freedesktop/portal/desktop', 'org.freedesktop.host.portal.Registry',
				'Register', GLib.Variant('(sa{sv})', (GrantStore.APP_ID, {})), None,
				Gio.DBusCallFlags.NONE, 15000, None)
		except GLib.Error:
			raise NativeError('portal_identity_unavailable', 'Supported portal Registry registration failed; no consent request was made.') from None
		self.portal_owner = owner

	def eligible(self, token):
		# Read only this app/token permission, never enumerate or modify another grant.
		try:
			permissions = self.bus.call_sync('org.freedesktop.impl.portal.PermissionStore',
				'/org/freedesktop/impl/portal/PermissionStore', 'org.freedesktop.impl.portal.PermissionStore',
				'GetPermission', GLib.Variant('(sss)', ('remote-desktop', token, GrantStore.APP_ID)),
				None, Gio.DBusCallFlags.NONE, 15000, None).unpack()[0]
		except GLib.Error as error:
			if Gio.DBusError.get_remote_error(error) == 'org.freedesktop.portal.Error.NotFound':
				return False
			raise NativeError('portal_eligibility_unavailable', 'Cannot read the exact owned persistent permission; no restore request was made.') from None
		return permissions == ['yes']

	def connect(self):
		if self.store is None:
			self.store = GrantStore()
		self.store.acquire()
		try:
			self.register_identity()
		except Exception:
			self.store.release()
			raise
		if self.session:
			return
		remote = 'org.freedesktop.portal.RemoteDesktop'
		session = None
		try:
			grant = self.store.grant()
			authorized = self.store.consume_authorization()
			token = grant.get('Token')
			if not authorized and (token is None or not self.eligible(token)):
				raise NativeError('portal_regrant_required', 'No eligible durable owned grant. Coordinate approval, then run the bridge --authorize-persistent-consent once (expires in five minutes). No dialog was opened.')
			# Consume before SelectDevices consumes the portal token, including all failure paths.
			generation = grant['Generation'] + 1
			self.store.write('grant.json', {'SchemaVersion': 1, 'AppId': GrantStore.APP_ID,
				'Status': 'consumed', 'Generation': generation})
			created = self.request(remote, 'CreateSession', '(a{sv})', [{
				'session_handle_token': GLib.Variant('s', 'buffaly' + uuid.uuid4().hex)}])
			session = created['session_handle']
			options = {'types': GLib.Variant('u', 3), 'persist_mode': GLib.Variant('u', 2)}
			if token is not None and not authorized:
				options['restore_token'] = GLib.Variant('s', token)
			self.request(remote, 'SelectDevices', '(oa{sv})', [session, options])
			self.request('org.freedesktop.portal.ScreenCast', 'SelectSources', '(oa{sv})', [session, {
				'types': GLib.Variant('u', 1), 'multiple': GLib.Variant('b', False),
				'cursor_mode': GLib.Variant('u', 2)}])
			started = self.request(remote, 'Start', '(osa{sv})', [session, '', {}])
			new_token = started.get('restore_token')
			if new_token is None:
				raise NativeError('portal_persistence_unavailable', 'Portal returned no restore token. No automatic retry will occur.')
			self.store.validate_token(new_token)
			if not self.eligible(new_token):
				raise NativeError('portal_persistence_unavailable', 'Returned token has no durable owned permission (transient or revoked). No automatic retry will occur.')
			self.store.write('grant.json', {'SchemaVersion': 1, 'AppId': GrantStore.APP_ID,
				'Status': 'ready', 'Generation': generation, 'Token': new_token})
			if started.get('devices', 0) & 3 != 3 or len(started.get('streams', [])) != 1:
				raise NativeError('portal_devices_unavailable', 'One monitor and keyboard/pointer permission are required.')
			node, properties = started['streams'][0]
			position = properties.get('position')
			size = properties.get('size')
			if position is None or size is None:
				raise NativeError('portal_geometry_unavailable', 'Stream must expose logical position and size.')
			result, descriptors = self.bus.call_with_unix_fd_list_sync(self.portal_owner,
				'/org/freedesktop/portal/desktop', 'org.freedesktop.portal.ScreenCast', 'OpenPipeWireRemote',
				GLib.Variant('(oa{sv})', (session, {})), GLib.VariantType.new('(h)'),
				Gio.DBusCallFlags.NONE, 15000, None, None)
			self.fd = descriptors.get(result.unpack()[0])
			self.pipeline = Gst.parse_launch('pipewiresrc fd=' + str(self.fd) + ' path=' + str(node) +
				' do-timestamp=true ! videoconvert ! video/x-raw,format=RGB ! appsink name=frames max-buffers=1 drop=true sync=false')
			if self.pipeline.set_state(Gst.State.PLAYING) == Gst.StateChangeReturn.FAILURE:
				raise NativeError('capture_unavailable', 'PipeWire pipeline failed to start.')
			self.stream = (node, position, size)
			self.session = session
		except Exception as error:
			try:
				try:
					self.reset_capture()
				except Exception:
					pass  # Preserve the primary connection error after independent cleanup attempts.
				if session:
					try:
						self.call('org.freedesktop.portal.Session', 'Close', '()', (), session)
					except GLib.Error:
						pass
			finally:
				self.store.release()
			if isinstance(error, GLib.Error):
				raise NativeError('portal_connection_failed', 'Portal connection failed. The attempted grant was consumed; coordinate regrant if required. No automatic retry will occur.') from None
			if isinstance(error, OSError):
				raise NativeError('portal_state_io_error', 'Private grant storage or capture resource operation failed; no automatic retry will occur.') from None
			raise

	def list_apps(self):
		apps = []
		live = set()
		root = Atspi.get_desktop(0)
		for i in range(min(root.get_child_count(), 300)):
			app = root.get_child_at_index(i)
			pid = app.get_process_id()
			windows = []
			for j in range(min(app.get_child_count(), 100)):
				window = app.get_child_at_index(j)
				if window.get_role() not in (Atspi.Role.FRAME, Atspi.Role.DIALOG, Atspi.Role.WINDOW):
					continue
				key = str(pid) + ':' + str(j)
				live.add(key)
				if key not in self.windows or self.windows[key][1] != window:
					self.windows[key] = (uuid.uuid4().hex, window)
				windows.append({'Id': self.windows[key][0], 'App': str(pid), 'Title': window.get_name() or '', 'ProcessId': pid})
			if windows:
				apps.append({'Id': str(pid), 'DisplayName': app.get_name() or '', 'IsRunning': True, 'Windows': windows})
		self.windows = {key: value for key, value in self.windows.items() if key in live}
		return apps

	def window(self, id):
		self.list_apps()
		for token, window in self.windows.values():
			if token == id and not window.get_state_set().contains(Atspi.StateType.DEFUNCT):
				return window
		raise NativeError('target_closed', 'Window no longer exists; list applications again.')

	def bounds(self, window):
		r = window.get_component_iface().get_extents(Atspi.CoordType.SCREEN)
		if r.width <= 0 or r.height <= 0:
			raise NativeError('target_geometry_unavailable', 'AT-SPI window bounds unavailable.')
		return [r.x, r.y, r.width, r.height]

	def observe(self, request):
		self.elements = {}
		self.observed_target = None
		window = self.window(request['WindowId'])
		self.connect()
		bounds = self.bounds(window)
		# A full monitor frame remains unscaled; screenshot-relative coordinates map directly to portal coordinates.
		sample = self.pipeline.get_by_name('frames').emit('try-pull-sample', 5 * Gst.SECOND)
		if sample is None:
			raise NativeError('capture_timeout', 'No PipeWire frame received.')
		caps = sample.get_caps().get_structure(0)
		width, height = caps.get_value('width'), caps.get_value('height')
		if (width, height) != tuple(self.stream[2]):
			raise NativeError('unsupported_monitor_scaling', 'Pixel size differs from portal logical geometry; input is disabled rather than misdirected.')
		buffer = sample.get_buffer()
		# Encode using GStreamer, not System.Drawing (unsupported on Linux).
		encoder = Gst.parse_launch('appsrc name=input format=time ! videoconvert ! pngenc snapshot=true ! appsink name=output sync=false')
		encoder.get_by_name('input').set_property('caps', sample.get_caps())
		encoder.set_state(Gst.State.PLAYING)
		try:
			encoder.get_by_name('input').emit('push-buffer', buffer.copy())
			encoder.get_by_name('input').emit('end-of-stream')
			png = encoder.get_by_name('output').emit('try-pull-sample', 5 * Gst.SECOND)
			if png is None:
				raise NativeError('capture_encode_failed', 'PNG encoder returned no sample.')
			data = png.get_buffer().extract_dup(0, png.get_buffer().get_size())
		finally:
			encoder.set_state(Gst.State.NULL)
		elements, tree = self.read_elements(window)
		result = {'Window': {'Id': request['WindowId'], 'App': str(window.get_process_id()),
			'Title': window.get_name() or '', 'ProcessId': window.get_process_id()},
			'Bounds': bounds, 'Tree': tree, 'Png': base64.b64encode(data).decode('ascii'),
			'Width': width, 'Height': height, 'OriginX': self.stream[1][0], 'OriginY': self.stream[1][1]}
		self.elements = elements
		self.observed_target = (request['WindowId'], request['ObservationId'])
		return result

	def read_elements(self, window):
		elements = {}
		lines = []
		def visit(element, depth):
			if len(lines) >= 300 or depth > 20:
				return
			index = str(len(lines))
			elements[index] = element
			lines.append(index + ' ' + element.get_role_name() + ' ' + (element.get_name() or ''))
			for i in range(min(element.get_child_count(), 300 - len(lines))):
				visit(element.get_child_at_index(i), depth + 1)
		visit(window, 0)
		return elements, '\n'.join(lines)

	def notify(self, method, signature, values):
		self.call('org.freedesktop.portal.RemoteDesktop', method, '(oa{sv}' + signature + ')',
			(self.session, {}, *values))

	def move(self, x, y):
		# Portals expose no surface ownership/hit test; ACTIVE and bounds cannot exclude overlays.
		raise NativeError('pointer_target_unverifiable', 'Global pointer injection is disabled: compositor-authoritative target ownership is unavailable.')

	def action(self, request):
		if getattr(self, 'observed_target', None) != (request['WindowId'], request['ObservationId']):
			raise NativeError('stale_observation', 'Native elements do not belong to this exact window and observation.')
		if request['Operation'] in ('Drag', 'Scroll') or (request['Operation'] == 'Click' and not request.get('ElementIndex')):
			raise NativeError('pointer_target_unverifiable', 'Global pointer injection is disabled: compositor-authoritative target ownership is unavailable.')
		window = self.window(request['WindowId'])
		if self.bounds(window) != request['Bounds']:
			raise NativeError('stale_observation', 'Window geometry changed.')
		if not window.get_state_set().contains(Atspi.StateType.ACTIVE):
			raise NativeError('target_not_active', 'Activate the owned target window before input.')
		operation = request['Operation']
		element = None
		if request.get('ElementIndex'):
			element = self.elements.get(request['ElementIndex'])
			if element is None or element.get_state_set().contains(Atspi.StateType.DEFUNCT):
				raise NativeError('invalid_element_id', 'Observe the target again.')
		if operation == 'SetValue':
			if not element.get_editable_text_iface().set_text_contents(request['Value']):
				raise NativeError('accessibility_action_failed', 'EditableText rejected the value.')
		elif operation == 'SelectText':
			text = element.get_text_iface()
			# GI Accessible.get_text is an interface accessor, not Text.get_text(offsets).
			value = Atspi.Text.get_text(text, 0, -1)
			needle = request['Text']
			start = value.find(request['Prefix'] + needle + request['Suffix'])
			if start < 0 or value.find(request['Prefix'] + needle + request['Suffix'], start + 1) >= 0:
				raise NativeError('text_not_unique', 'Provide unique text with prefix and suffix.')
			start += len(request['Prefix'])
			if request['Selection'] != 'text':
				raise NativeError('unsupported_selection', 'Linux supports selection=text only.')
			if not text.set_selection(0, start, start + len(needle)) and not text.add_selection(start, start + len(needle)):
				raise NativeError('accessibility_action_failed', 'Text selection rejected.')
		elif operation == 'PerformSecondaryAction' or (operation == 'Click' and element is not None):
			action = element.get_action_iface()
			name = request.get('Action', '')
			matches = [i for i in range(action.get_n_actions()) if not name or action.get_action_name(i) == name]
			if len(matches) != 1 or not action.do_action(matches[0]):
				raise NativeError('unsupported_accessibility_action', 'Specify one available AT-SPI action by exact name.')
		elif operation in ('TypeText', 'PressKey'):
			keys = []
			if operation == 'TypeText':
				for character in request['Text']:
					code = ord(character)
					if character in ('\n', '\r', '\t'):
						keys.append([0xff09 if character == '\t' else 0xff0d])
					elif code < 32:
						raise NativeError('unsupported_character', 'Control characters other than newline/tab are unsupported.')
					else:
						keys.append([code if code <= 255 else 0x01000000 | code])
			else:
				names = {'CTRL': 0xffe3, 'ALT': 0xffe9, 'SHIFT': 0xffe1, 'SUPER': 0xffeb,
					'ENTER': 0xff0d, 'TAB': 0xff09, 'ESC': 0xff1b, 'BACKSPACE': 0xff08,
					'DELETE': 0xffff, 'HOME': 0xff50, 'END': 0xff57, 'LEFT': 0xff51,
					'UP': 0xff52, 'RIGHT': 0xff53, 'DOWN': 0xff54, 'SPACE': 0x20}
				chord = []
				for part in request['Key'].split('+'):
					upper = part.upper()
					if upper in names:
						chord.append(names[upper])
					elif len(part) == 1:
						chord.append(ord(part.lower()))
					else:
						raise NativeError('unsupported_key', 'Use CTRL/ALT/SHIFT/SUPER and a supported named key or character.')
				keys.append(chord)
			for chord in keys:
				pressed = []
				try:
					for code in chord:
						self.notify('NotifyKeyboardKeysym', 'iu', (code, 1))
						pressed.append(code)
				finally:
					for code in reversed(pressed):
						self.notify('NotifyKeyboardKeysym', 'iu', (code, 0))
		else:
			raise NativeError('unsupported_operation', '' + operation)
		return True

	def reset_capture(self):
		# Release partially constructed capture resources as well as completed sessions.
		pipeline, fd = self.pipeline, self.fd
		self.pipeline = None
		self.fd = None
		self.stream = None
		self.session = None
		failure = False
		try:
			if pipeline:
				pipeline.set_state(Gst.State.NULL)
		except Exception:
			failure = True
		try:
			if fd is not None:
				os.close(fd)
		except OSError:
			failure = True
		if failure:
			raise NativeError('capture_cleanup_failed', 'Capture resource cleanup failed after all independent release attempts.')

	def close(self):
		failure = None
		try:
			if self.session:
				self.call('org.freedesktop.portal.Session', 'Close', '()', (), self.session)
		except Exception as error:
			failure = error
		finally:
			try:
				self.reset_capture()
			except Exception as error:
				if failure is None:
					failure = error
			finally:
				try:
					if self.store:
						self.store.release()
				except Exception as error:
					if failure is None:
						failure = error
				finally:
					self.loop.quit()
		if failure:
			raise failure


def main():
	if sys.argv[1:] == ['--authorize-persistent-consent']:
		GrantStore().authorize()
		print('One persistent consent attempt authorized for five minutes. No dialog opened. The next capture consumes this authorization even if denied or timed out.')
		return
	if sys.argv[1:]:
		raise NativeError('invalid_arguments', 'Supported option: --authorize-persistent-consent')
	desktop = Desktop()
	try:
		for line in sys.stdin:
			try:
				request = json.loads(line)
				operation = request['Operation']
				if operation == 'ListApps':
					value = desktop.list_apps()
				elif operation == 'Observe':
					value = desktop.observe(request)
				else:
					value = desktop.action(request)
				response = {'Success': True, 'Value': value, 'Code': '', 'Message': ''}
			except NativeError as error:
				response = {'Success': False, 'Value': None, 'Code': error.code, 'Message': str(error)}
			except Exception as error:
				# Native library diagnostics may contain method arguments, including restore tokens.
				response = {'Success': False, 'Value': None, 'Code': 'native_unexpected_error', 'Message': 'Unexpected native failure (' + type(error).__name__ + ').'}
			print(json.dumps(response), flush=True)
	finally:
		desktop.close()


if __name__ == '__main__':
	main()
