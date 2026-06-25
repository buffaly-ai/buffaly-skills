<%function GridFooter
{
	(return (GridFooter 100))
}%>

<%function GridFooter NumColumns{%>
	<%returnex{%>
	<tr class="GridFooterRow">
		<td colspan=<%NumColumns%> style="padding: 6px;">
		<div class="row GridFooterRow">
			
				<div class=" col-4"  style="text-align: left; vertical-align: middle;">
			
					<span class="GridFirst"> <i class="fas fa-angle-double-left"></i> </span> 
					<span class="GridPrev"> <i class="fas fa-angle-left"></i> </span> 

				</div>
				<div class="GridFooter col-4" style="text-align: center;">

				</div>
				<div class=" col-4" style="text-align: right;">
					<span class="GridNext"> <i class="fas fa-angle-right"></i> </span> 
					<span class="GridLast"> <i class="fas fa-angle-double-right"></i> </span> 
				</div>
			
		</div>
		</td>
	</tr>
	<%}%>
<%}%>

<%function GridFooter2 NumColumns{%>
	<%returnex{%>
	<tr class="GridFooterRow">
		<td colspan=<%NumColumns%> style="padding: 6px;">
		<table border="0" width="100%" cellspacing=0>
		<tbody style="border: 0px;">
		<tr class="GridFooterRow">
			<td style="text-align: left;">
			
				<span class="GridFirst"> <i class="fas fa-angle-double-left"></i> </span> 
				<span class="GridPrev"> <i class="fas fa-angle-left"></i> </span> 

		</td>
		<td class="GridFooter" style="text-align: center;">

		</td>
		<td style="text-align: right;">
			<span class="GridNext"> <i class="fas fa-angle-right"></i> </span> 
			<span class="GridLast"> <i class="fas fa-angle-double-right"></i> </span> 
		</td>
		</tr>
		</tbody>
		</table>
		</td>
	</tr>
	<%}%>
<%}%>
<%reference BasicUtilities BasicUtilities%>
<%reference RooTrax.Common RooTrax.Common%>

<%import BasicUtilities 'BasicUtilities.StringUtil' StringUtil%>
<%import BasicUtilities 'BasicUtilities.JsonUtil' JsonUtil%>

<%import RooTrax.Common 'RooTrax.Common.DateUtil' DateUtil%>
<%import RooTrax.Common 'RooTrax.Common.FormatUtil' FormatUtil%>
<%import RooTrax.Common 'RooTrax.Common.MathExtensions' MathExtensions%>




<%function FormatDateCalendar Date
{
	(return (ifneq (Date) "" {(DateUtil.FormatDateCalendar (Date)) }))
}%>


<%function FormatDate Date
{
	(return (FormatDateCalendar (Date)))
}%>

<%function StringToMoney Money
{
	(return (ifneq (Money) ""{ (FormatUtil.StringToMoney (Money)) }))
}%>


<%function StringToPhone Phone
{
	(return (ifneq (Phone) "" { (FormatUtil.StringToPhone (Phone)) }) )
}%>

<%function StringToDecimal Value
{
	(return (ifneq (Value) "" { (FormatUtil.StringToDecimal (Value) "0.####") }))
}%>

<%function StringToPercent Value
{
	(return (ifneq (Value) "" { (FormatUtil.StringToDecimal (Value) "0.##") }))
}%>

<%function add s1 s2
{
	(return (MathExtensions.Add (s1) (s2)))
}%>


<%function inString s1 s2
{
	(return (StringUtil.InString (s1) (s2)))
}%>

<%function ToJsonSafeString s
{
	(return (JsonUtil.ToSafeString2 (ifeq (s) "" "" (s))))
}%>


<%function GetStateDropDown FieldName
{
	(returnex{%>
<select  class="form-select" kcs:FieldName="<%FieldName%>">
  <option value="">Select State</option>
  <option value="AL">Alabama</option>
  <option value="AK">Alaska</option>
  <option value="AZ">Arizona</option>
  <option value="AR">Arkansas</option>
  <option value="CA">California</option>
  <option value="CO">Colorado</option>
  <option value="CT">Connecticut</option>
  <option value="DE">Delaware</option>
  <option value="FL">Florida</option>
  <option value="GA">Georgia</option>
  <option value="HI">Hawaii</option>
  <option value="ID">Idaho</option>
  <option value="IL">Illinois</option>
  <option value="IN">Indiana</option>
  <option value="IA">Iowa</option>
  <option value="KS">Kansas</option>
  <option value="KY">Kentucky</option>
  <option value="LA">Louisiana</option>
  <option value="ME">Maine</option>
  <option value="MD">Maryland</option>
  <option value="MA">Massachusetts</option>
  <option value="MI">Michigan</option>
  <option value="MN">Minnesota</option>
  <option value="MS">Mississippi</option>
  <option value="MO">Missouri</option>
  <option value="MT">Montana</option>
  <option value="NE">Nebraska</option>
  <option value="NV">Nevada</option>
  <option value="NH">New Hampshire</option>
  <option value="NJ">New Jersey</option>
  <option value="NM">New Mexico</option>
  <option value="NY">New York</option>
  <option value="NC">North Carolina</option>
  <option value="ND">North Dakota</option>
  <option value="OH">Ohio</option>
  <option value="OK">Oklahoma</option>
  <option value="OR">Oregon</option>
  <option value="PA">Pennsylvania</option>
  <option value="RI">Rhode Island</option>
  <option value="SC">South Carolina</option>
  <option value="SD">South Dakota</option>
  <option value="TN">Tennessee</option>
  <option value="TX">Texas</option>
  <option value="UT">Utah</option>
  <option value="VT">Vermont</option>
  <option value="VA">Virginia</option>
  <option value="WA">Washington</option>
  <option value="WV">West Virginia</option>
  <option value="WI">Wisconsin</option>
  <option value="WY">Wyoming</option>
</select>
	
	<%})
}%>

<%function GetQuickHelpControls sContent bEditable
{
	(returnex{%>
<div class="col-4 hidden" id="divQuickHelp">
        <div class="card">
                <div class="card-header bg-light d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center">
                                <i class="material-symbols-outlined me-2">help</i>
                                <h4 class="mb-0">Quick Help</h4>
                        </div>
                        <div class="d-flex align-items-center">
                                <%if (bEditable){%>
                                <a href="javascript: OnEditQuickHelp();" class="text-dark text-decoration-none d-inline-flex align-items-center justify-content-center ms-3" aria-label="Edit quick help">
                                        <i class="material-symbols-outlined">edit</i>
                                </a>
                                <%}%>
                                <a href="javascript: ToggleQuickHelpOff(0);" class="text-dark text-decoration-none d-inline-flex align-items-center justify-content-center ms-3" aria-label="Close quick help">
                                        <i class="material-symbols-outlined">close</i>
                                </a>
                        </div>
                </div>
                <div class="card-body">
                        <h5 class="mb-3 text-uppercase d-flex align-items-center">
                                <i class="mdi mdi-account-circle me-2"></i>
                                <span class="d-inline-flex align-items-center"><%MainPanelTitle%></span>
                        </h5>
                        <div id="divQuickHelpContent">
                                <%sContent%>
                        </div>
                </div>
        </div>
                <%if (bEditable){%>

                 <script type='text/javascript' src='/JsonWs/FairPath.Admin.Business.PageLayouts.ashx.js'></script>
		<script type="text/javascript">
			PageLayoutsValidators.GetQuickHelpContentByURL.DefaultContent.Validators = [];
			function OnEditQuickHelp() {
				var sUrl = "/" + StringUtil.RightOfFirst(StringUtil.Between(document.location.href, "//", "?"), "/");
				var sDefaultContent = _$("divQuickHelpContent").innerHTML;
				let oContent = PageLayouts.GetQuickHelpContentByURL(sUrl, sDefaultContent);
				Page.Redirect("/content-edit", { ContentID: oContent.ContentID }, "_blank");
			}

		</script>

		<%}%>
</div>	
	
	<%})
}%>