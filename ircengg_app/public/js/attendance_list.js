frappe.listview_settings['Attendance'] = {
	add_fields: ["status", "attendance_date"],
	get_indicator: function (doc) {
		if (["Present", "Work From Home"].includes(doc.status)) {
			return [__(doc.status), "green", "status,=," + doc.status];
		} else if (["Absent", "On Leave"].includes(doc.status)) {
			return [__(doc.status), "red", "status,=," + doc.status];
		} else if (doc.status == "Half Day") {
			return [__(doc.status), "orange", "status,=," + doc.status];
		}
	},

// 	onload: function(list_view) {
// 		let me = this;
// 		const months = moment.months();
// 		list_view.page.add_inner_button(__("Mark Attendance"), function() {
// 			let dialog = new frappe.ui.Dialog({
// 				title: __("Mark Attendance"),
// 				fields: [{
// 					fieldname: 'employee',
// 					label: __('For Employee'),
// 					fieldtype: 'Link',
// 					options: 'Employee',
// 					get_query: () => {
// 						return {query: "erpnext.controllers.queries.employee_query"};
// 					},
// 					reqd: 1,
// 					onchange: function() {
// 						dialog.set_df_property("unmarked_days", "hidden", 1);
// 						dialog.set_df_property("status", "hidden", 1);
// 						dialog.set_df_property("exclude_holidays", "hidden", 1);
// 						dialog.set_df_property("month", "value", '');
// 						dialog.set_df_property("unmarked_days", "options", []);
// 						dialog.no_unmarked_days_left = false;
// 					}
// 				},
// 				{
// 					label: __("For Month"),
// 					fieldtype: "Select",
// 					fieldname: "month",
// 					options: months,
// 					reqd: 1,
// 					onchange: function() {
// 						if (dialog.fields_dict.employee.value && dialog.fields_dict.month.value) {
// 							dialog.set_df_property("status", "hidden", 0);
// 							dialog.set_df_property("exclude_holidays", "hidden", 0);
// 							dialog.set_df_property("unmarked_days", "options", []);
// 							dialog.no_unmarked_days_left = false;
// 							me.get_multi_select_options(
// 								dialog.fields_dict.employee.value,
// 								dialog.fields_dict.month.value,
// 								dialog.fields_dict.exclude_holidays.get_value()
// 							).then(options => {
// 								if (options.length > 0) {
// 									dialog.set_df_property("unmarked_days", "hidden", 0);
// 									dialog.set_df_property("unmarked_days", "options", options);
// 								} else {
// 									dialog.no_unmarked_days_left = true;
// 								}
// 							});
// 						}
// 					}
// 				},
// 				{
// 					label: __("Status"),
// 					fieldtype: "Select",
// 					fieldname: "status",
// 					options: ["Present", "Absent", "Half Day", "Work From Home"],
// 					hidden: 1,
// 					reqd: 1,

// 				},
// 				{
// 					label: __("Exclude Holidays"),
// 					fieldtype: "Check",
// 					fieldname: "exclude_holidays",
// 					hidden: 1,
// 					onchange: function() {
// 						if (dialog.fields_dict.employee.value && dialog.fields_dict.month.value) {
// 							dialog.set_df_property("status", "hidden", 0);
// 							dialog.set_df_property("unmarked_days", "options", []);
// 							dialog.no_unmarked_days_left = false;
// 							me.get_multi_select_options(
// 								dialog.fields_dict.employee.value,
// 								dialog.fields_dict.month.value,
// 								dialog.fields_dict.exclude_holidays.get_value()
// 							).then(options => {
// 								if (options.length > 0) {
// 									dialog.set_df_property("unmarked_days", "hidden", 0);
// 									dialog.set_df_property("unmarked_days", "options", options);
// 								} else {
// 									dialog.no_unmarked_days_left = true;
// 								}
// 							});
// 						}
// 					}
// 				},
// 				{
// 					label: __("Unmarked Attendance for days"),
// 					fieldname: "unmarked_days",
// 					fieldtype: "MultiCheck",
// 					options: [],
// 					columns: 2,
// 					hidden: 1
// 				}],
// 				primary_action(data) {
// 					if (cur_dialog.no_unmarked_days_left) {
// 						frappe.msgprint(__("Attendance for the month of {0} , has already been marked for the Employee {1}",
// 							[dialog.fields_dict.month.value, dialog.fields_dict.employee.value]));
// 					} else {
// 						frappe.confirm(__('Mark attendance as {0} for {1} on selected dates?', [data.status, data.month]), () => {
// 							frappe.call({
// 								method: "erpnext.hr.doctype.attendance.attendance.mark_bulk_attendance",
// 								args: {
// 									data: data
// 								},
// 								callback: function (r) {
// 									if (r.message === 1) {
// 										frappe.show_alert({
// 											message: __("Attendance Marked"),
// 											indicator: 'blue'
// 										});
// 										cur_dialog.hide();
// 									}
// 								}
// 							});
// 						});
// 					}
// 					dialog.hide();
// 					list_view.refresh();
// 				},
// 				primary_action_label: __('Mark Attendance')

// 			});
// 			dialog.show();
// 		});
// 	},

// 	get_multi_select_options: function(employee, month, exclude_holidays) {
// 		return new Promise(resolve => {
// 		    frappe.db.get_list('Attendance',{filters:[['attendance_date', 'between', ['2022-12-01', '2022-12-31']],['employee','=',employee]],fields:['attendance_date'],limit:40}).then((attendance)=>{
// 		        console.log(attendance)
// 		        var options=[];
// 		        var date=[];
// 		        for(var i=1;i<=31;i++)
// 		        {
// 		            i<10?date.push('2022-12-0'+i):date.push('2022-12-'+i);
// 		        }
// 		        var d;
// 		        d=date.filter((val)=>{
// 		            var a=0; 
// 		            attendance.forEach((b)=>{
// 		                val==b.attendance_date?a=1:'';
// 		            });
// 		            if(a===0){return val}
// 		        });
// 		        console.log(d)
// 		        d.forEach((data)=>{
// 		            var momentObj = moment(data, 'YYYY-MM-DD');
// 		            var x = momentObj.format('DD-MM-YYYY');
// 		            options.push({
//                         "label": x,
// 					    "value": data,
// 					    "checked": 1
// 		             });
// 		        });
// 		        console.log(options);
// 		        resolve(options);
//  		});
	
// 	})
// }
}


//# sourceURL=attendance__list_js