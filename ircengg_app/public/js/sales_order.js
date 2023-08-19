frappe.ui.form.on("Sales Order", {
    from_template: function(frm) {
        frm.clear_table("tasks")
        frappe.model.with_doc("Project Template", frm.doc.from_template, function() {
            var tabletransfer= frappe.model.get_doc("Project Template", frm.doc.from_template)
            $.each(tabletransfer.tasks, function(index, row){
                var d = frm.add_child("tasks");
                d.task = row.task;
                d.subject = row.subject;
                frm.refresh_field("tasks");
            });
        });
    },
});

frappe.ui.form.on('Sales Order Item', {
    render(frm, cdt, cdn) {
        frm.set_df_property("delivery_date", "reqd", 0);
    }
});
frappe.ui.form.on("Sales Order", {
    before_submit: function(frm) {
        frappe.db.get_list('File',{filters:{'attached_to_doctype':'Sales Order','attached_to_name':cur_frm.doc.name}}).then((value)=>{
            if(value.length===0)
            {
                frappe.msgprint('Please attach Sales Order')
                frappe.validated=false
            }
            
        })
    }
});

