frappe.ui.form.on('Employee', {
	refresh(frm) {
		// your code here
	},
	get_indicator(doc) {
	    frappe.msgprint('Sanjiv')
        if (doc.employment_type) {
            return [__("Employment Type"), "green", "employment_type,=,Full-time"];
        } else {
            return [__("Employment Type"), "darkgrey", "employment_type,=,Intern"];
        }
    }
})