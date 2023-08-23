frappe.listview_settings['Employee Checkin'] = {
    add_fields: ['log_type', 'area'], // Add the required fields here

    get_indicator: function (doc) {
        // Check if the 'area' field is present and it is a number
        if (doc.area !== undefined && !isNaN(doc.area)) {
            var areaValue = parseFloat(doc.area);

            // Check if the area is greater than 10 km
            if (areaValue >= 10) {
                return [__(doc.log_type), "red", "log_type,=," + doc.log_type];
            } else {
                return [__(doc.log_type), "green", "log_type,=," + doc.log_type];
            }
        }
        return [__(doc.log_type), "grey", "log_type,=," + doc.log_type];
    }
};