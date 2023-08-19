var leave_taken='';
var total_leaves=0;
var leave_type_allocated='';
frappe.ui.form.on('Leave Application', {
	before_save(frm) {
	    var from_date=new Date(cur_frm.doc.from_date);
	    var end_date=new Date(cur_frm.doc.to_date);
	    if((from_date.getMonth()==1||from_date.getMonth()==2) && (end_date.getMonth()==2||end_date.getMonth()==3))
	    {
	        console.log('from_date.getMonth()');
	        var date_diff;
	        if(from_date.getMonth()==1 && (end_date.getMonth()==2))
	        {
	            date_diff=end_date-new Date(from_date.getFullYear()+'-03-01');
	        }
	        else if(from_date.getMonth()==2 && (end_date.getMonth()==3))
	        {
	            date_diff=new Date(from_date.getFullYear()+'-03-31')-from_date;
	        }
	        else
	        {
	            date_diff=end_date-from_date;
	        }
	        var no_of_days=(date_diff/(1000 * 60 * 60 * 24))+1;
	        console.log(no_of_days);
	        if(no_of_days>4)
	        {
	            frappe.msgprint(`You cannot take ${cur_frm.doc.leave_type} more than 4 days in the month of march`);
	            frappe.validated = false;
	        }
	    }
	},
    onload(frm){
        $("div").remove(".form-dashboard-section.custom");
        if (frm.doc.employee)
        {
            $("div").remove(".form-dashboard-section.custom");
            frm.trigger('make_dashboard')
        }
        
    },
	make_dashboard: function(frm) {
		var leave_details;
		let lwps;
		if (frm.doc.employee) {
			frappe.call({
				method: "erpnext.hr.doctype.leave_application.leave_application.get_leave_details",
				async: false,
				args: {
					employee: frm.doc.employee,
					date: frm.doc.from_date || frm.doc.posting_date
				},
				callback: function(r) {
					if (!r.exc && r.message['leave_allocation']) {
						leave_details = r.message['leave_allocation'];
					}
					if (!r.exc && r.message['leave_approver']) {
						frm.set_value('leave_approver', r.message['leave_approver']);
					}
					lwps = r.message["lwps"];
				}
			});
			$("div").remove(".form-dashboard-section.custom");
			frappe.db.get_value('Leave Allocation',{'employee':cur_frm.doc.employee},'leave_type').then((leave_type)=>{
			    delete leave_details['Casual Leave'];
			    frm.dashboard.add_section(
			    	frappe.render_template('leave_application_dashboard', {
			    		data: leave_details
			    	}),
			    	__("Allocated Leaves")
			    );
			    frm.dashboard.show();
			    var leaves=Object.keys(leave_details);
			    leaves.push('Leave Without Pay')
			    frm.set_query('leave_type', function() {
		        	return {
		        		filters: [
		        		    // ['leave_type_name', '!=', 'Casual Leave']
		        			['leave_type_name', 'in', leaves]
		        		]
		        	};
		        });
			 //   frm.refresh();
			});
		}
	}
});