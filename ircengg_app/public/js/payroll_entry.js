var done='';
var employees='';
var s_slip='';
var tdays;
var unmarked_attendance;
frappe.ui.form.on('Payroll Entry', {
    get_total_days(frm){
        if(cur_frm.doc.end_date && cur_frm.doc.start_date){
            var [y1,m1,d1] = cur_frm.doc.start_date.split('-');
            var [y2,m2,d2] = cur_frm.doc.end_date.split('-');
            var strdate = new Date(m1+'/'+d1+'/'+y1);
            var enddate = new Date(m2+'/'+d2+'/'+y2);
            tdays = enddate.getDate()-strdate.getDate()+1;
        }   
    },
    refresh(frm){
        frm.get_field('employees').grid.grid_pagination.page_length = 200;
        frm.trigger('get_total_days')
        if(cur_frm.doc.employees){
            cur_frm.doc.employees.forEach((emp_list,i)=>{
                cur_frm.doc.employees[i].total_no_of_days = tdays;
            });
        }
    },
    setup(frm)
    {
        frm.fields_dict.attendance_detail_html.html("");
    },
    send_day(frm){
        frm.trigger('get_slip').then(()=>{
            frm.doc.employees.forEach((emp_entry)=>{
                var index = s_slip.findIndex(slip=>slip.employee==emp_entry.employee);
                frappe.db.set_value('Salary Slip',s_slip[index].name,'leave_without_pay',emp_entry.total_no_of_days-emp_entry.no_of_days_present);
            });
        });
    },
    delete_full_time(frm){
        if(frm.doc.delete_full_time){
            var data=[];
            cur_frm.doc.employees.forEach((employee)=>{
                data.push(employee.employee);
            });
            //console.log(data);
            frappe.db.get_list('Employee',{filters:[['employment_type', '=', 'Full-time'],['status','=','active'],['name','in',data]],fields:['name'],limit:500}).then((employee)=>{
                var index=[];
                cur_frm.doc.employees.forEach((emp_list,i)=>{
                    employee.find((emp)=>emp.name==emp_list.employee)?index.push(i):'';
                });
                //console.log(index)
                for(var i=index.length-1;i>=0;i--)
                {
                    //cur_frm.get_field('employees').grid.grid_rows[index[i]+1].remove();
                    var j=Number(index[i])
                    //console.log(j);
                    cur_frm.get_field('employees').grid.grid_rows[j].remove();
                }
            });
        }
    },
    get_employee_filters: function (frm) {
		let filters = {};
		filters['salary_slip_based_on_timesheet'] = frm.doc.salary_slip_based_on_timesheet;

		let fields = ['company', 'start_date', 'end_date', 'payroll_frequency', 'payroll_payable_account',
			'currency', 'department', 'branch', 'designation', 'employment_type'];

		fields.forEach(field => {
			if (frm.doc[field]) {
				filters[field] = frm.doc[field];
			}
		});

		if (frm.doc.employees) {
			let employees = frm.doc.employees.filter(d => d.employee).map(d => d.employee);
			if (employees && employees.length) {
				filters['employees'] = employees;
			}
		}
		return filters;
	},
    fulltime_employee(frm){
        if(!tdays){
            frm.trigger('get_total_days');
        }
        try
        {
           cur_frm.clear_table("employees");
           frm.refresh_field('employees');
        }
        catch(err){}
        if(cur_frm.doc.fulltime_employee && frm.doc.start_date && frm.doc.end_date){
            frappe.call({
                    method: "ircengg_app.ircengg_app.custom_py.payroll_entry.payroll_entry",
                    args: {
                        data:{
                            'start_date':frm.doc.start_date,
                            'end_date':frm.doc.end_date
                        }
                    },
                    callback: function (r) {
                        // console.log(r.employees);
                        frm.doc.employees=r.employees
                        frm.refresh_field('employees')
		    		},
		    		freeze: true,
		    		freeze_message: __('Get List Of Full-Time Employee...')
                });
            // frappe.db.get_list('Employee',{filters:{'employment_type':'Full-time','status':'active'},fields:['name','employee_name','designation','department'],limit:500}).then((emp_id)=>{
            //     var employee_slip=[];
            //     emp_id.forEach((emp)=>employee_slip.push(emp.name));
            //     //console.log(employee_slip);
            //     frappe.db.get_list('Salary Slip',{filters:[['employee','in',employee_slip],['start_date','=',cur_frm.doc.start_date],['end_date','=',cur_frm.doc.end_date]],fields:['employee','name'],limit:500}).then((slip)=>{
            //         emp_id.forEach((id)=>{
            //             var v;
            //             let myPromise = new Promise(function(myResolve, myReject) {
            //                 v=2;
            //                 slip.map((s)=>{
            //                     if(s.employee===id.name){
            //                         v=1;
            //                     }
            //                 });
            //                 myResolve(); // when successful
            //                 myReject();  // when error
            //             });
            //             myPromise.then(()=>{
            //                 if(v==2)
            //                 {
            //                     console.log(id.name)
            //                     frm.add_child('employees', {
            //                         employee: id.name,
            //                         employee_name: id.employee_name,
            //                         designation: id.designation,
            //                         department: id.department,
            //                         total_no_of_days: tdays
            //                     });
            //                     employees_slip.push({
            //                         employee: id.name,
            //                         employee_name: id.employee_name,
            //                         designation: id.designation,
            //                         department: id.department,
            //                         total_no_of_days: tdays
            //                     })
            //                     // frm.refresh_field('employees');
            //                 }
            //                 cur_frm.refresh();
            //             });
            //         });
            //     });
            // });
        }
        else if(!frm.doc.start_date || !frm.doc.end_date)
        {
            frappe.msgprint('Please Enter Start or End Date');
        }
    },
    get_slip(frm){
        var employee_entry = [];
        cur_frm.doc.employees.forEach((employee)=>{
            employee_entry.push(employee.employee);
        });
        frappe.db.get_list('Salary Slip',{filters:[['start_date','=',cur_frm.doc.start_date],['end_date','=',cur_frm.doc.end_date],['employee','in',employee_entry]],fields:['employee','name'],limit:500}).then((slip)=>{
            s_slip = slip;
        });
    },
    remove_employees(frm){
        if(frm.doc.remove_unmark_attendance_employee){
            var index=[];
            frappe.call({
				method: 'validate_employee_attendance',
				args: {},
				callback: function (r) {
					render_employee_attendance(cur_frm, r.message);
				},
				doc: cur_frm.doc,
				freeze: true,
				freeze_message: __('Validating Employee Attendance...')
			}).then((emp_atten)=>{
			    emp_atten.message.forEach((row)=>{
			        cur_frm.doc.employees.forEach((element,i) =>{
			            element.employee===row.employee?index.push(i):'';
			        })
			    });
			    //console.log(index);
			    for(var i=index.length-1;i>=0;i--)
                {
                    var j=Number(index[i])
                    cur_frm.get_field('employees').grid.grid_rows[j].remove();
                }
			});
        }
    },
    validate_attendance_to_employees(frm){
        if(frm.doc.validate_attendance_to_employees)
        {
            frappe.call({
                method: "ircengg_app.ircengg_app.custom_py.attendance.attendance_employee",
                args: {
                    data:cur_frm.doc
                },
                callback: function (r) {
                    unmarked_attendance=r.message;
                    //console.log(r.message);
					render_employee_attendance(frm, r.message);
				},
				freeze: true,
				freeze_message: __('Validating Employee Attendance...')
            });
        }
        else
        {
            frm.fields_dict.attendance_detail_html.html("");
        }
    },
    get_employee_details: function (frm) {
		return frappe.call({
			doc: frm.doc,
			method: 'fill_employee_details',
		}).then(r => {
			if (r.docs && r.docs[0].employees) {
				frm.employees = r.docs[0].employees;
				frm.dirty();
				frm.save();
				frm.refresh();
				if (r.docs[0].validate_attendance) {
					render_employee_attendance(frm, r.message);
				}
			}
			console.log(r.docs[0].employees)
		});
	},
    absent_attendance(frm){
        if(frm.doc.absent_attendance)
        {
            if(!frm.doc.validate_attendance_to_employees || cur_frm.doc.docstatus===0)
            {
                frappe.msgprint('Validate Attendance To Employees is not checked or salary slip is not created');
            }
            else
            {
                //frappe.msgprint('Valies is not checked or salary slip is not created');
                frm.trigger('get_slip').then(()=>{
                    unmarked_attendance.forEach((emp_entry)=>{
                        var index = s_slip.findIndex(slip=>slip.employee==emp_entry.employee);
                        frappe.db.set_value('Salary Slip',s_slip[index].name,'absent_days',emp_entry.unmarked_days);
                    });
                });
            }
        }
    }
});
render_employee_attendance =  (frm, data)=> {
	frm.fields_dict.attendance_detail_html.html(
		frappe.render_template('employees_to_mark_attendance', {
			data: data
		})
	);
};
frappe.ui.form.on('Payroll Employee Detail', {
	employees_add(frm, cdt, cdn) {
	    cur_frm.doc.employees[cur_frm.doc.employees.length-1].total_no_of_days=tdays;
	    cur_frm.refresh_field('employees');
	}
})