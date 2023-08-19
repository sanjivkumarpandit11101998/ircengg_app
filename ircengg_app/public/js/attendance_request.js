frappe.ui.form.on('Attendance Request', {
	update_site(frm) {
	   if(frm.doc.update_site)
	   {
	       if(frm.doc.update_site)
	       {
	           frappe.db.get_list('Attendance',{filters:{'attendance_request':frm.doc.name},fields:['name']}).then((att)=>{
	               att.forEach((val)=>{
	                   frappe.db.set_value('Attendance',val.name,'site_name',frm.doc.site_name);
	               });
	           })
	           
	       }
	   }
		// your code here
	}
});