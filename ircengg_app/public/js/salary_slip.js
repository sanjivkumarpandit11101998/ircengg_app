frappe.ui.form.on('Salary Slip', {
	update_absent_days(frm) {
	    if(frm.doc.update_absent_days)
	    {
	        if(frm.doc.employment_type=='Full-time')
	        {
	            console.log('sanjiv');
	            frappe.call({
                    method: "ircengg_app.ircengg_app.custom_py.attendance.attendance_employee",
                    args: {
                        doc:{
                            'start_date':frm.doc.start_date,
                            'end_date':frm.doc.end_date,
                            'employees':[{'employee':frm.doc.employee}]
                        }
                    },
                    callback: function (r) {
                        //console.log(r.message[0].unmarked_days);
                        cur_frm.set_value("leave_without_pay", r.message[0].unmarked_days);//absent_days
		    			cur_frm.set_value("payment_days", cur_frm.doc.total_working_days-cur_frm.doc.leave_without_pay-r.message[0].unmarked_days);
		    		},
		    		freeze: true,
		    		freeze_message: __('Validating Employee Attendance...')
                });
	        }
	    }
	    else
	    {
	        cur_frm.set_value("leave_without_pay", 0);//absent_days
		    cur_frm.set_value("payment_days", cur_frm.doc.total_working_days-cur_frm.doc.leave_without_pay);
	    }
	},
	employee(frm){
	    frm.trigger('leave_taken');
	},
	start_date(frm){
	    frm.trigger('leave_taken');
	},
	end_date(frm){
	    frm.trigger('leave_taken');
	},
	leave_taken(frm){
	    if(frm.doc.employee && frm.doc.start_date && frm.doc.end_date)
	    {
	        frappe.db.get_list('Leave Application',{filters:[['employee','=',frm.doc.employee],['leave_type','!=','Leave Without Pay'],['status','=','Approved'],['to_date','between',[cur_frm.doc.start_date,cur_frm.doc.end_date]],['from_date','between',[cur_frm.doc.start_date,cur_frm.doc.end_date]]],fields:['total_leave_days']}).then((all_leaves)=>{
	            var sum=0;
	            all_leaves.forEach(leave=>sum+=leave.total_leave_days);
	            cur_frm.doc.casual_leave=sum;
	            frm.refresh();
	        });
	    }
	    else
	    {
	        frappe.msgprint('employee and Start date and End date may be missing');
	    }
	}
});