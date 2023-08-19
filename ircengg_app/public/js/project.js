frappe.ui.form.on('Project', {
    onload: function(frm) {
        var sales_order = frm.doc.sales_order;
        if (sales_order) {
            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Sales Order",
                    name: sales_order,
                    filters: {
                        fields: ["from_template"]
                    }
                },
                callback: function(response) {
                    if (response.message) {
                        var from_template = response.message.from_template;
                        frm.set_value("project_template", from_template);
                       
                    }
                }
                
            });
        }
    }
});