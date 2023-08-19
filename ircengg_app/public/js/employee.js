frappe.ui.form.on('Employee', {
	send_attendance_link(frm) {
        if(frm.doc.send_attendance_link==1 && cur_frm.doc.prefered_email)
        {
            console.log(cur_frm.doc.prefered_email);
            frappe.call({
                    method: "ircengg_app.ircengg_app.custom_py.attendance.email_attendance_link",
                    args: {
                        doc:{
                            'email_id':cur_frm.doc.prefered_email
                    }
                }
            });
        }
    }
    // onload(frm){
    //     frm.set_value('leave_type_allocated',frappe.db.get_value('Leave Allocated',{filters:[['employee','=',frm.doc.name],['']]}))
    // }
});