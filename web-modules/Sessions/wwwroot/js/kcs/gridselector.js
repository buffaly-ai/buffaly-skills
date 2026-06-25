/**
 * KCS Utility Module: gridselector
 * ------------------------------------------------------------
 * Adds multi-select behaviour on top of JsonWsGrid3. It tracks the
 * selected row keys client-side, toggles row styling, and exposes
 * lifecycle hooks so bulk operations can interrogate the selection set.
 *
 * Key helpers
 *  - new GridSelector(gridInstance)
 *      Wrap an existing grid and auto-wire the `.SelectControls` buttons
 *      to start/finish selection modes.
 *  - GridSelector.GetSelected()
 *      Returns the array of row keys chosen by the user.
 *  - `rowselected` event
 *      Listen for updates via `selector.addEvent('rowselected', handler)`
 *      to enable/disable bulk action buttons.
 *
 * Usage example – execute a bulk archive:
 * ```js
 * const selector = new GridSelector(patientGrid);
 * selector.addEvent('rowselected', function() {
 *     _$("btnArchive").setDisabled(selector.GetSelected().length === 0);
 * });
 *
 * ControlUtil.AddClick(_$("btnArchive"), function() {
 *     JsonMethod.call("/Patients.aspx", "Archive", { ids: selector.GetSelected() }, function() {
 *         selector.OnCancel(); // reset mode back to default grid behaviour
 *         patientGrid.Refresh();
 *     });
 * });
 * ```
 */
class GridSelector extends _Events
{
	MAX_SELECT_SIZE=2000;

	m_setSelected= null;
	m_Grid= null;

	m_SavedOnRowClick= null;
	m_SavedOnComplete= null;

	constructor(oGrid) {
		super();
		this.m_Grid = oGrid;
		this.m_setSelected = new StlSet();

		$$(".SelectControls .StartSelect").forEach(x => ControlUtil.AddEvent(x, "click", this.OnStartSelect.bind(this)));
		$$(".SelectControls .SelectPage").forEach(x => ControlUtil.AddEvent(x, "click", this.OnSelectPage.bind(this)));
		$$(".SelectControls .SelectAll").forEach(x => ControlUtil.AddEvent(x, "click", this.OnSelectAll.bind(this)));
		$$(".SelectControls .Finish").forEach(x => ControlUtil.AddEvent(x, "click", this.OnFinish.bind(this)));
		$$(".SelectControls .Cancel").forEach(x => ControlUtil.AddEvent(x, "click", this.OnCancel.bind(this)));

		var oThis = this;
		this.m_Grid.OnComplete = function() {
			oThis.m_Grid.GetDataRows().forEach(function(oTr) {
				var iRowKey = oTr.getAttribute("kcs:RowKey");

                                if (ObjectUtil.HasValue(iRowKey) && oThis.m_setSelected.contains(iRowKey))
                                        ControlUtil.AddClass(oTr, "Selected");
			} .bind(this))
		};
	}

	GetSelected() {
		return this.m_setSelected.ToArray();
	}

	OnStartSelect() {
		this.m_SavedOnComplete = this.m_Grid.OnComplete;
		this.m_SavedOnRowClick = this.m_Grid.OnRowClick;

		this.m_Grid.OnRowClick = this.OnSelectRow.bind(this);
		this.m_Grid.OnComplete=this.OnRefreshSelected.bind(this);
		$$(".SelectControls").forEach(x => ControlUtil.Show(x));
		$$(".StartSelect").forEach(x => ControlUtil.Hide(x));

		UserMessages.DisplayNow("Please select the rows you want, then choose an action below.", "Info");
	}

	OnSelectRow(iRowKey, e, el) {
                if (ControlUtil.HasClass(el, "Selected")) {
                        this.m_setSelected.remove(iRowKey);
                }
                else
                        this.m_setSelected.insert(iRowKey);

                if (ControlUtil.HasClass(el, "Selected"))
                        ControlUtil.RemoveClass(el, "Selected");
                else
                        ControlUtil.AddClass(el, "Selected");

		$$('.SelectControls .SelectedCount').forEach(x => x.innerHTML = this.m_setSelected.length());

		this.fireEvent('rowselected');
	}

	OnSelectPage() {
		this.m_Grid.GetDataRows().forEach(function(oTr) {
			var iRowKey = oTr.getAttribute("kcs:RowKey");

			if (ObjectUtil.HasValue(iRowKey) && !this.m_setSelected.contains(iRowKey))
				this.OnSelectRow(iRowKey, null, oTr);
		} .bind(this))

	}

	OnSelectAll() {


		if (this.m_Grid.maxrows > this.MAX_SELECT_SIZE) {
			alert("Cannot select more than " + this.MAX_SELECT_SIZE.toString() + " rows, please narrow down your selection using the search box");
			return;
		}
		var iSavedSize = this.m_Grid.SkipSize;
		var iSavedNumRows = this.m_Grid.skip;
		this.m_Grid.skip = 0;
		this.m_Grid.SkipSize = 1000;
		var oThis = this;
		this.m_Grid.GetGrid(function(oRes) {
			ControlUtil.GetChildren($$$(['div', oRes]), "tr[kcs:RowKey]").forEach(function(oTr) {
				var iRowKey = oTr.getAttribute("kcs:RowKey");
				oThis.OnSelectRow(iRowKey, null, oTr);
			});

			oThis.m_Grid.OnComplete();
		})

		this.m_Grid.SkipSize = iSavedSize;
		this.m_Grid.skip = iSavedNumRows;
	}

	OnRefreshSelected() {
                this.m_Grid.GetDataRows().forEach(function(oTr) {
                        var iRowKey = oTr.getAttribute("kcs:RowKey");

                        if (ObjectUtil.HasValue(iRowKey) && this.m_setSelected.contains(iRowKey))
                                ControlUtil.AddClass(oTr, "Selected");
                }.bind(this))
	}

	OnFinish() {
		this.fireEvent("complete", [this.m_setSelected.ToArray()]); //fireEvent serializes an array back to args
	}

	OnCancel() {
                $$(".SelectControls").forEach(x => ControlUtil.AddClass(x, "Hidden"));
		this.m_Grid.OnRowClick = this.m_SavedOnRowClick;
		this.m_Grid.OnComplete = this.m_SavedOnComplete;

		this.m_Grid.Refresh(true);
	}
}
