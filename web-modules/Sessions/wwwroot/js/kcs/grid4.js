/**
 * KCS Utility Module: grid4
 * ------------------------------------------------------------
 * Client-side engine behind our JsonWs-backed tables. It tracks paging,
 * sorting, selection, and incremental refresh calls so that grid views
 * stay responsive even when data is loading asynchronously.
 *
 * Key entry points
 *  - JsonWsGrid3.Refresh(forceCount)
 *      Pulls data (and optionally count) from the configured JsonWs methods.
 *  - JsonWsGrid3.BindEvents() / HookSearchBox(controlId)
 *      (see file body) attach keyboard navigation and instant filtering.
 *  - JsonWsGrid3.OnDataReceived
 *      Assign a callback to inject custom row rendering or summaries.
 *
 * Usage example – initialise from a page script:
 * ```js
 * const grid = new JsonWsGrid3();
 * grid.JsonWsUrl = "/JsonWs/Patients.ashx";
 * grid.JsonWsGridMethod = "List";
 * grid.JsonWsCountMethod = "Count";
 * grid.ContentControlID = "patientRows";
 * grid.PagingControlID = "patientPager";
 * grid.Refresh();
 * ```
 *
 * Usage example – wire a live search input:
 * ```js
 * grid.SearchControlID = "txtSearch";
 * grid.OnFilterInput = function(value) {
 *     grid.search = value || '-';
 *     grid.Refresh(true);
 * };
 * BindJsToCss(grid.SearchControlID); // ensures key handlers from MasterPage
 * ```
 */
class JsonWsGrid3 extends _Events
{
	skip = 0;
	sort = '';
	search = '-';
	SkipSize = Globals.GridRowsPerPage;
	maxrows = -1;
	SortAscending = true;
	ExtraParams = {};
	JsonWsReturnsJson = false;
	JsonWsGridMethod = '';
	JsonWsCountMethod = '';
	JsonWsUrl = '';
	SearchControlID = '';
	ContentControlID = '';
	PagingControlID = null;
	EmptyDataTemplateID = '';
	OnRowClick() { }
	OnRowCtrlClick=null;
	OnBeforeRefresh()  { }
	OnComplete() { }
	OnFilterInput = null;
	IsRefreshing = false;
	RefreshInterval = 1000;
	AllowPageSizeEditing = false;
	AllowScrollWheel = false;
	m_EnterEventAttached = false;
	SelectedIndex = 0;
	OnDataReceived = null;
	OnEmptyData = null;

	m_iConcurrentCalls = 0;

	m_iProcessedRequestID=0;
	m_iProcessedCountRequestID=0;

	//initialize: function () {
	//	if (ObjectUtil.HasValue(Page.History)) {
	//		var self = this;
	//		Page.History.addListener(function (hashValue) {
	//			self.fromHistory(hashValue);
	//		});
	//	}

	//	if (ObjectUtil.HasValue(Page.Grids)) {
	//		Page.Grids.Insert(String.uniqueID(), this);
	//	}
	//},

	GetMaxRows () {
		return ObjectUtil.ToInt(this.maxrows);
	}

	GetSkip() {
		return ObjectUtil.ToInt(this.skip);
	}

	GetSkipSize() {
		return ObjectUtil.ToInt(this.SkipSize);
	}

	GetSelectedIndex() {
		return ObjectUtil.ToInt(this.SelectedIndex);
	}


	HighlightSelectedIndex() {
		if (this.GetSelectedIndex() > this.GetMaxRows() - 1)
			this.SelectedIndex = this.GetMaxRows() - 1;

		if (this.GetSelectedIndex() >= 0) {
			var oRows = this.GetDataRows();
                        if (oRows.length > 0 && this.GetSelectedIndex() < oRows.length) {
                                oRows.forEach(x => ControlUtil.RemoveClass(x, "Selected"));
                                ControlUtil.AddClass(oRows[this.GetSelectedIndex()], "Selected");
                        }
		}
	}

	GetDataRows() {
		return ControlUtil.GetChildren(this.ContentControlID, "tr[kcs:RowKey]");
	}

	StartRefreshing() {
		var iMoveBy = 0;
		if (!this.IsRefreshing) {
			this.BindRowClicks();
			this.Refresh();

                        var oFunc = (function () {
                                if (iMoveBy != 0) {
                                        this.MoveBy(iMoveBy);
                                        iMoveBy = 0;
                                }
                                else {
                                        this.Refresh();
                                }

                        }).bind(this);

                        setInterval(oFunc, this.RefreshInterval);

			this.IsRefreshing = true;
		}

		if (this.AllowScrollWheel) {
			ControlUtil.AddEvent(ControlUtil.GetControl(this.ContentControlID), 'mousewheel', function (event) {
				iMoveBy += -1 * Math.round(event.wheel);
				if (this.m_iConcurrentCalls == 0) {
					oFunc();
				}
				return false;
			}.bind(this));
		}
	}

	Refresh(bForce) {
		this.RefreshGrid(bForce);
	}
	
	GetSearchData()
	{
		let sNewSearch = '';

		if (!StringUtil.IsEmpty(this.SearchControlID)) {
			var oSearchControl = ControlUtil.GetControl(this.SearchControlID);
			if (null == oSearchControl)
				throw new Exception("JsonWsGrid cannot find control: " + this.SearchControlID);

			sNewSearch = ControlUtil.GetValue(oSearchControl);
			if (null != this.OnFilterInput)
				sNewSearch = this.OnFilterInput(sNewSearch);
		}

		return sNewSearch;
	}
	
	//This method refreshes the rows, but not the count
	RefreshGrid(bForce, bSuppressCount) {

		if (!ObjectUtil.HasValue(bSuppressCount))
			bSuppressCount = false;

		var sNewSearch = this.GetSearchData();
		
		if (!this.m_EnterEventAttached) {
			this.BindKeys();
		}

		bForce = bForce | false;
	
		if (bForce == true || this.search != sNewSearch) {

			this.OnBeforeRefresh();

			var bRefreshCount = !bSuppressCount && bForce == true || (this.search != sNewSearch);
			this.search = sNewSearch;
			this.setHistory();
			var oThis = this;

			let oargs=JSON.stringify(this.ExtraParams);

			this.MakeDataRequest(function (oRes, iRequestID) {
				if (null != iRequestID && null != oThis.m_iProcessedRequestID) {
					if (iRequestID<oThis.m_iProcessedRequestID) {
						console.log("Ignoring Old Grid Request ID: "+iRequestID+" "+oargs)
						return;
					}
					else {
						oThis.m_iProcessedRequestID=iRequestID;
					}
				}
				
				oThis.RefreshGrid_CB(oRes);
				if (bRefreshCount)
					oThis.RefreshCount();
				else
					oThis.BindCount();
			});

		}
	}

	MakeDataRequest(fCB) {
		var oArgs = null;
		oArgs = { Search: this.search, SortColumn: this.sort, SortAscending: this.SortAscending, SkipRows: this.GetSkip(), NumRows: this.GetSkipSize() }
		oArgs = Object.assign({}, oArgs, this.ExtraParams);

		this.m_iConcurrentCalls++;

		JsonMethod.call(this.JsonWsUrl, this.JsonWsGridMethod, oArgs,
			fCB);
	}

	GetGrid(fCB) {
		var oArgs = null;
		oArgs = { Search: this.search, SortColumn: this.sort, SortAscending: this.SortAscending, SkipRows: this.GetSkip(), NumRows: this.GetSkipSize() }
		oArgs = Object.assign({}, oArgs, this.ExtraParams);

		JsonMethod.call(this.JsonWsUrl, this.JsonWsGridMethod, oArgs, fCB);
	}

	RefreshGrid_CB(oRes) {

		this.m_iConcurrentCalls--;

		if (this.OnDataReceived)
			oRes = this.OnDataReceived(oRes);

		var oThis = this;
		var sText = oRes;
		var oContent = ControlUtil.GetControl(this.ContentControlID);
		if (!oContent)
			throw new Exception("The specified content container control does not exist: " + this.ContentControlID);

		oContent.innerHTML = sText;

		oContent.querySelectorAll(".Grid th").forEach(el => {
			var sSortOn = el.getAttribute('kcs:SortColumn');
                        if (!StringUtil.IsEmpty(sSortOn)) {
                                ControlUtil.AddClass(el, "Sortable");
				ControlUtil.AddEvent(el, 'mousedown', function (e) {
					if (oThis.sort == sSortOn)
						oThis.SortAscending = !oThis.SortAscending;

					oThis.sort = sSortOn;
					oThis.setHistory();
					oThis.RefreshGrid(true);
				});

				if (sSortOn == oThis.sort && oThis.SortAscending) {
					el.appendChild($$$(["i", { "class": "Sort float-end fa fa-arrow-down" }]));
				}
				else if (sSortOn == oThis.sort && !oThis.SortAscending) {
					el.appendChild($$$(["i", { "class": "Sort float-end fa fa-arrow-up" }]));
				}

			}

		});

		if (ObjectUtil.HasValue(oThis.OnComplete)) {
			oThis.OnComplete();
			oThis.fireEvent("complete");
		}

		this.BindRowClicks();
		this.HighlightSelectedIndex();
	}

	RefreshCount(bForce) {
		if (StringUtil.IsEmpty(this.JsonWsCountMethod)) {
			var oContent = ControlUtil.GetControl(this.ContentControlID);
			this.RefreshCount_CB(oContent.querySelectorAll(".Grid tr").length-1);
			return;
		}


		var oArgs=null;
		oArgs={ Search: this.search, SortColumn: this.sort, SortAscending: this.SortAscending, SkipRows: this.GetSkip(), NumRows: this.GetSkipSize() }
		oArgs=Object.assign({}, oArgs, this.ExtraParams);

		let sArgs=JSON.stringify(oArgs);

		var oThis=this;
		JsonMethod.call(this.JsonWsUrl, this.JsonWsCountMethod, oArgs,
			function (oRes, iRequestID) {

				if (null!=iRequestID&&null!=oThis.m_iProcessedCountRequestID) {
					if (iRequestID<oThis.m_iProcessedCountRequestID) {
						console.log("Ignoring Old Grid Count Request ID: "+iRequestID+" "+sArgs)
						return;
					}
					else {
						oThis.m_iProcessedCountRequestID=iRequestID;
					}
				}

				oThis.RefreshCount_CB(oRes);
			});
	}

	RefreshCount_CB(oRes) {

		var oThis = this;
		oThis.maxrows = oRes;

		this.BindCount();
	}


	BindCount() {
		var oThis = this;
		var oContent = ControlUtil.GetControl(this.ContentControlID);

		if (oThis.GetMaxRows() == 0 && ObjectUtil.HasValue(this.EmptyDataTemplateID) && null != ControlUtil.GetControl(this.EmptyDataTemplateID)) {

			if (oThis.OnEmptyData)
				oThis.OnEmptyData();

			var oEmptyDataTemplate = ControlUtil.GetControl(this.EmptyDataTemplateID);

                        if (oEmptyDataTemplate) {
                                oContent.innerHTML = "";
                                let oCopy = oEmptyDataTemplate.cloneNode(true);
                                oCopy.id = "";
                                oContent.appendChild(oCopy);
                                ControlUtil.Show(oCopy);
                        }
		}
		else {

			var iLower = (this.GetSkip() + 1);
			var iUpper = iLower + oThis.GetSkipSize() - 1;
			if (iUpper > oThis.GetMaxRows()) {
				iUpper = oThis.GetMaxRows();
			}

			if (iLower > oThis.GetMaxRows() && oThis.GetMaxRows() > 0) {
				iLower = oThis.GetMaxRows();
				oThis.skip = iLower - 1;
				oThis.Refresh(true);
			}

			if (iLower == 1 && iUpper == 0)
				iLower = 0;

			var oPagingControl = (this.PagingControlID == null ? oContent : ControlUtil.GetControl(this.PagingControlID));
			var oGridFooter = oPagingControl.querySelector('.GridFooter')

			if (oGridFooter) {
				if (this.AllowPageSizeEditing) {
					oGridFooter.innerHTML = "";

					var sPagingSummary = 'Now showing ' + iLower.toString() + ' - ' + iUpper.toString() + ' of ' + oThis.GetMaxRows().toString() + ', Per Page: ';
					var oPageSizeWrapper = $$$(['span', ['span', sPagingSummary]]);
					var oPageSizeInput = $$$(['input', { type: 'text', inputmode: 'numeric', min: 10, max: 1000, step: 0, style: 'width:45px;text-align:right;-webkit-appearance: none; margin: 0; -moz-appearance: textfield;', value: oThis.GetSkipSize() }]);

					ControlUtil.AddClass(oPageSizeInput, 'GridPageSizeInput');

					ControlUtil.AddEvent(oPageSizeInput, 'blur', function () {
						oThis.SetSkipSizeAndRefresh(this.value, this);
					});

					ControlUtil.AddEvent(oPageSizeInput, 'keydown', function (oEvent) {
						if (!ObjectUtil.HasValue(oEvent))
							return;

						var bIsEnter = (oEvent.key === 'Enter' || oEvent.keyCode === 13 || oEvent.which === 13);
						if (bIsEnter) {
							if (ObjectUtil.HasValue(oEvent.preventDefault))
								oEvent.preventDefault();

							oThis.SetSkipSizeAndRefresh(this.value, this);
						}
					});

					oPageSizeWrapper.appendChild(oPageSizeInput);
					oGridFooter.appendChild(oPageSizeWrapper);
				}


				else
					oGridFooter.innerHTML = 'Now showing '+iLower.toString()+' - '+iUpper.toString()+' of '+oThis.GetMaxRows().toString();
			}

			var oGridPrev = oPagingControl.querySelector('.GridPrev');
			var oGridNext = oPagingControl.querySelector('.GridNext');
			var oGridFirst = oPagingControl.querySelector('.GridFirst');
			var oGridLast = oPagingControl.querySelector('.GridLast');

			if (oGridPrev) {
				//oGridPrev.removeEvents('mousedown');
				ControlUtil.AddEvent(oGridPrev, 'mousedown', function (e) {
					oThis.MovePrevious();
					return false;
				});
			}

			if (oGridFirst) {
				////oGridFirst.removeEvents('mousedown');
				ControlUtil.AddEvent(oGridFirst, 'mousedown', function (e) {
					oThis.MoveFirst();
					return false;
				});
			}

			if (oGridNext) {
				//oGridNext.removeEvents('mousedown');
				ControlUtil.AddEvent(oGridNext, 'mousedown', function (e) {
					oThis.MoveNext();
					return false;
				});
			}

			if (oGridLast) {
				//oGridLast.removeEvents('mousedown');
				ControlUtil.AddEvent(oGridLast, 'mousedown', function (e) {
					oThis.MoveLast();
					return false;
				});
			}
		}
	}

	BindKeys() {
		var oSearchControl = ControlUtil.GetControl(this.SearchControlID);

		if (ObjectUtil.HasValue(oSearchControl)) {
			//if (!ControlUtil.HasEvent(oSearchControl, "keydown:keys(enter)")) {
			//	oSearchControl.addEvent("keydown:keys(enter)", function (e) {
			//		var oSelectedIndex = (this.GetSelectedIndex() >= 0 ? this.GetDataRows()[this.GetSelectedIndex()] : null);
			//		if (ObjectUtil.HasValue(oSelectedIndex) && oSelectedIndex != null) {
			//			oSelectedIndex.fireEvent('mousedown');
			//		}
			//		new Event(e).stop();

			//		return false;
			//	}.bind(this));

			//}

			//if (!ControlUtil.HasEvent(oSearchControl, "keydown:keys(up)")) {
			//	oSearchControl.addEvent("keydown:keys(up)", function (e) {
			//		this.SelectedIndex = Math.max(this.GetSelectedIndex() - 1, 0);
			//		this.HighlightSelectedIndex();
			//		new Event(e).stop();
			//		return false;
			//	}.bind(this));
			//}

			//if (!ControlUtil.HasEvent(oSearchControl, "keydown:keys(down)")) {
			//	oSearchControl.addEvent("keydown:keys(down)", function (e) {
			//		this.SelectedIndex = Math.min(this.GetSelectedIndex() + 1, this.GetSkipSize() - 1);
			//		this.HighlightSelectedIndex();
			//		new Event(e).stop();
			//		return false;
			//	}.bind(this));
			//}
		}
		this.m_EnterEventAttached = true;
	}

	BindRowClicks () {
		var oContent = ControlUtil.GetControl(this.ContentControlID);
		if (!oContent)
			throw new Exception("The specified content container control does not exist: " + this.ContentControlID);

		var oThis = this;
		var bAlt = false;
		var bFirst = true;
		let iIndex = 0;

		oContent.querySelectorAll(".Grid tr").forEach(el => {

			
                        if (!ControlUtil.HasClass(el, "GridFooterRow") && !ControlUtil.HasClass(el, "GridInsertRow") && !bFirst) {
                                ControlUtil.AddEvent(el, 'mouseenter', function (e) {
                                        ControlUtil.AddClass(el, 'Hover');
                                });

                                ControlUtil.AddEvent(el,  'mouseleave', function (e) {
                                        ControlUtil.RemoveClass(el, 'Hover');
                                });


				if (ObjectUtil.HasValue(oThis.OnRowClick)) {
					el.setAttribute("kcs:Index", iIndex);
					iIndex++;
					ControlUtil.AddEvent(el, 'mousedown', function (e) {

						var evt = e ? e : window.event;
						var bCtrl=(evt&&(evt.control||evt.ctrlKey));

						var bRight=(evt&&(evt.button==2));
						if (bRight)
							return;
						

						if (oThis.OnBeforeRowClick)
							oThis.OnBeforeRowClick(el.getAttribute("kcs:Index"));

						var iKey = el.getAttribute("kcs:RowKey");
						if (null != iKey) {						

							if (bCtrl && null != oThis.OnRowCtrlClick)
								oThis.OnRowCtrlClick(iKey, e, el, bCtrl);
							else
								oThis.OnRowClick(iKey, e, el, bCtrl);
						}
						else {
							if (bCtrl && null != oThis.OnRowCtrlClick)
								oThis.OnRowCtrlClick(iKey, e, el, bCtrl);
							else
								oThis.OnRowClick(e, el, bCtrl);
						}
					});
				}

                                if (bAlt)
                                        ControlUtil.AddClass(el, "Alt");

			}
			else
				bFirst = false;
			bAlt = !bAlt;
		});

	}

	MoveBy(i) {
		this.skip += i;
		this.skip = Math.min(this.skip, this.GetMaxRows());
		this.skip = Math.max(this.skip, 0);
		this.RefreshGrid(true, true);
		this.BindCount();
		//		this.setHistory();
	}

	MoveNext() {
		var oThis = this;
		if (oThis.GetSkip() < oThis.GetMaxRows() - oThis.GetSkipSize()) {
			oThis.skip = Math.min(oThis.GetSkip() + oThis.GetSkipSize(), oThis.GetMaxRows());
		}
		else
			oThis.skip = Math.max(oThis.GetMaxRows() - oThis.GetSkipSize(), 0);

		oThis.RefreshGrid(true);

		this.setHistory();
	}

	MovePrevious () {
		var oThis = this;
		if (oThis.GetSkip() > 0) {
			oThis.skip = Math.max(oThis.GetSkip() - oThis.GetSkipSize(), 0);
			oThis.RefreshGrid(true);
		}
		this.setHistory();
	}

	MoveFirst () {
		var oThis = this;
		if (oThis.GetSkip() > 0) {
			oThis.skip = 0;
			oThis.RefreshGrid(true);
		}
		this.setHistory();
	}

	MoveLast() {
		var oThis = this;
		oThis.skip = Math.max(oThis.GetMaxRows() - oThis.GetSkipSize(), 0);
		oThis.RefreshGrid(true);
		this.setHistory();
	}

	MoveToLower (iVal) {
		this.skip = iVal - 1;
		this.skip = Math.max(this.GetSkip(), 0);
		this.skip = Math.min(this.GetSkip(), this.GetMaxRows() - 1);
		this.RefreshGrid(true);
		this.setHistory();
	}

	MoveToUpper(iVal) {
		this.skip = iVal - this.GetSkip();
		this.skip = Math.max(this.GetSkipSize(), 0);
		this.skip = Math.min(this.GetSkipSize(), this.GetMaxRows());
		this.RefreshGrid(true);
		this.setHistory();
	}



	SetSkipSize (iVal) {
		if (iVal > 1) {
			this.SkipSize = Math.min(iVal, 1000);
		}
	}

	SetSkipSizeAndRefresh (iVal, oInput) {
		this.SetSkipSize(iVal);
		this.ShowPageSizeUpdateFeedback(oInput);
		this.Refresh(true);
	}

	ShowPageSizeUpdateFeedback (oInput) {
		if (!ObjectUtil.HasValue(oInput))
			return;

		ControlUtil.AddClass(oInput, 'GridPageSizeInputUpdated');

		window.setTimeout(function () {
			ControlUtil.RemoveClass(oInput, 'GridPageSizeInputUpdated');
		}, 600);
	}

	setHistory () {

		let state = {}

		state.Sort = this.sort;
		state.SortAscending = this.SortAscending;
		state.SkipRows = this.GetSkip();
		state.Search = this.search;
		state.SkipSize = this.GetSkipSize();



		if (ObjectUtil.HasValue(this.m_ObjectsName)) {
			Page.LocalStorage.set(this.m_ObjectsName + ".State", state);
		}
	}

	fromHistory () {

		if (ObjectUtil.HasValue(this.m_ObjectsName)) {
			let state = Page.LocalStorage.get(this.m_ObjectsName + ".State");

			if (ObjectUtil.HasValue(state)) {
				this.sort = ObjectUtil.IsDefined(state.Sort) ? state.Sort : this.sort;
				this.SortAscending = ObjectUtil.IsDefined(state.SortAscending) ? state.SortAscending : this.SortAscending;
				this.skip = state.SkipRows;
				this.SetSkipSize(state.SkipSize);

				//Removed saving search
				//this.search = StringUtil.IsEmpty(state.Search) ? "-" : state.Search;
				//var oSearchControl = $(this.SearchControlID);
				//if (ObjectUtil.HasValue(oSearchControl))
				//	ControlUtil.SetValue(oSearchControl, state.Search);
			}

		}
	}

	m_ObjectsName = null;

	OnBeforeRowClick(iIndex) {
		let oIterator = null;
		if (this.m_ObjectsName) {
			oIterator = GridIterators.GridToIterator(this, iIndex, this.m_ObjectsName);
		}
		else if (window["ObjectsName"]) {
			oIterator = GridIterators.GridToIterator(this, iIndex, ObjectsName);
		}
		return oIterator;
	}
}

class GridIterators {
	static GridToIterator(oGrid, iIndex, sIteratorName) {
		let oIterator = {};
		oIterator.JsonWsUrl = oGrid.JsonWsUrl;
		oIterator.JsonWsGridMethod = oGrid.JsonWsGridMethod;
		oIterator.JsonWsCountMethod = oGrid.JsonWsCountMethod;
		oIterator.Sort = oGrid.sort;
		oIterator.SortAscending = oGrid.SortAscending;
		oIterator.SkipRows = oGrid.GetSkip() + ObjectUtil.ToInt(iIndex);
		oIterator.Search = oGrid.search;
		oIterator.ExtraParams = oGrid.ExtraParams;
		oIterator.Index = iIndex;
		oIterator.MaxRows = oGrid.maxrows;

		GridIterators.SetCurrentIterator(oIterator, sIteratorName);

		return oIterator;
	}

	static IteratorToGrid(oIterator) {
		let oGrid = new JsonWsGrid3();
		oGrid.JsonWsUrl = oIterator.JsonWsUrl;
		oGrid.JsonWsGridMethod = oIterator.JsonWsGridMethod;
		oGrid.JsonWsCountMethod = oIterator.JsonWsCountMethod;
		oGrid.sort = oIterator.Sort;
		oGrid.SortAscending = oIterator.SortAscending;
		oGrid.skip = oIterator.SkipRows;
		oGrid.SkipSize = 1;
		oGrid.search = oIterator.Search;
		oGrid.ExtraParams = oIterator.ExtraParams;
		oGrid.maxrows = oIterator.MaxRows;

		return oGrid;
	}

	
	static OnNextIterator(sIteratorName) {
		let oIterator = GridIterators.GetCurrentIterator(sIteratorName);
		let oGrid = GridIterators.IteratorToGrid(oIterator);

		if (oGrid.skip + 1 >= oGrid.maxrows)
			return false;

		oGrid.skip++;
		oIterator.SkipRows = oGrid.skip;

		oGrid.MakeDataRequest(function (oHTML) {
			let sID = StringUtil.LeftOfFirst(StringUtil.RightOfFirst(oHTML, 'kcs:RowKey="'), '"');

			if (StringUtil.IsEmpty(sID)) {
				UserMessages.DisplayNow("Couldn't find next record", "Info");
				return false;
			}


			GridIterators.SetCurrentIterator(oIterator, sIteratorName);

			let query = Page.QueryString();
			query[Object.keys(query)[0]] = sID;
			delete query["GetValue"];
			Page.Redirect(UrlUtil.GetUrlWithoutParams(document.location.href), query);
			//console.log(query)
		});

		return true;
	}


	static OnPreviousIterator(sIteratorName) {
		let oIterator = GridIterators.GetCurrentIterator(sIteratorName);
		let oGrid = GridIterators.IteratorToGrid(oIterator);

		if (oGrid.skip <= 0)
			return false;

		oGrid.skip--;
		oIterator.SkipRows = oGrid.skip;

		oGrid.MakeDataRequest(function (oHTML) {
			let sID = StringUtil.LeftOfFirst(StringUtil.RightOfFirst(oHTML, 'kcs:RowKey="'), '"');

			if (StringUtil.IsEmpty(sID)) {
				UserMessages.DisplayNow("Couldn't find next record", "Info");
				return false;
			}

			GridIterators.SetCurrentIterator(oIterator, sIteratorName);

			let query = Page.QueryString();
			query[Object.keys(query)[0]] = sID;
			delete query["GetValue"];
			Page.Redirect(UrlUtil.GetUrlWithoutParams(document.location.href), query);
		});

		return true;
	}

	static GetCurrentIterator(sIteratorName) {
		return Page.LocalStorage.get(sIteratorName + ".GridIterator")
	}

	static SetCurrentIterator(oIterator, sIteratorName) {
		Page.LocalStorage.set(sIteratorName + ".GridIterator", oIterator);

	}


}

class JsonWsGrid4 extends JsonWsGrid3 {

}