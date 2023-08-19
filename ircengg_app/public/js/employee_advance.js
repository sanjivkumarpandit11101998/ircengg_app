function validate_dates(idx, doc, tour_start_date, tour_end_date) {
    var error = "";

    if (!doc.start_date)
        error += "- Row " + (idx + 1) + ": Start Date is missing.<br>";
    if (!doc.end_date)
        error += "- Row " + (idx + 1) + ": End Date is missing.<br>";
    if (doc.start_date && doc.end_date) {
        /* Only if either date is valid */
        if (doc.start_date > doc.end_date)
            error += "- Row " + (idx + 1) + ": Start Date is after End Date.<br>";
        if (doc.start_date < tour_start_date)
            error += "- Row " + (idx + 1) + ": Start Date before Tour Start Date.<br>";
        if (doc.end_date > tour_end_date)
            error += "- Row " + (idx + 1) + ": End Date is after Tour End Date.<br>";
    }

    return error;
}

function validate_hotel_accomodation(idx, doc, tour_start_date, tour_end_date) {
    var error = "";

    if (doc.advance_type != "Hotel/Room Accommodation")
        return error;

    if (!doc.room_rate_per_day)
        error += "- Row " + (idx + 1) + ": Room Rate per day is missing.<br>";
    if (doc.room_rate_per_day <= 0)
        error += "- Row " + (idx + 1) + ": Room Rate per day cannot be 0 or less.<br>";
    if (!doc.total_number_of_rooms || doc.total_number_of_rooms <= 0)
        error += "- Row " + (idx + 1) + ": Total Number of Rooms cannot be 0 or less.<br>";
   
    if (error.length <= 0) {
        /* Perform the calculations part if nothing is missing */
        var sdate = new Date(doc.start_date);
        var edate = new Date(doc.end_date);

        var no_of_days = ((edate.getTime() - sdate.getTime())/(1000 * 3600 * 24));

        var rent = no_of_days * doc.room_rate_per_day * doc.total_number_of_rooms;

        doc.number_of_days = no_of_days;
        doc.advance_amount = rent;
        doc.excess_amount = (doc.room_rate_per_day - 500) * no_of_days * doc.total_number_of_rooms;
    }

    return error;
}

function validate_for_GST_bills(idx, doc) {
    var error = "";
    
    /* If the is_taxable field is selected by user, then all the other GST
     * related details are mandatory
    */
    if (doc.is_taxable) {
        /* Check if GST information is available */
        if (!doc.vendor_address)
            error += "- Row " + (idx + 1) + ": Vendor Address is missing.<br>";
        if (!doc.vendor_gst_number)
            error += "- Row " + (idx + 1) + ": Vendor GST No. is missing.<br>";
        if (!doc.igst_value || doc.igst_value <= 0)
            error += "- Row " + (idx + 1) + ": GST Value is missing.<br>";
        if (!doc.principal_amount || doc.principal_amount <= 0)
            error += "- Row " + (idx + 1) + ": Principle Amount is missing.<br>";

    }
    return error;
}

function validate_taxi(idx, doc) {
    var error = "";
    if (doc.mode_of_travel != "Auto/Taxi")
        return error;
    
    /* In case of Auto/taxi, cost is mandatory */
    if (!doc.per_day_cost_of_taxi || doc.per_day_cost_of_taxi <= 0)
        error += "- Row " + (idx + 1) + ": in case of Auto/Taxi Travel, Per Day Rate of Taxi is mandatory and cannot be 0.<br>";
    if (!doc.number_of_taxi || doc.number_of_taxi <= 0)
        error += "- Row " + (idx + 1) + ": in case of Auto/Taxi Travel, Number of Taxi is mandatory and cannot be 0.<br>";
    
    if (error.length <= 0) {
        /* Perform the calculations part if nothing is missing */
        var sdate = new Date(doc.start_date);
        var edate = new Date(doc.end_date);

        var no_of_days = ((edate.getTime() - sdate.getTime())/(1000 * 3600 * 24)) + 1;
        var taxi_rent = no_of_days * doc.number_of_taxi * doc.per_day_cost_of_taxi;

        /* Calculate Cost or Taxi */
        doc.advance_amount = taxi_rent;
    }
    
    return error;

}

function validate_travel_end_location(idx, doc) {
    var error = "";
    var flag = 0;
    
    var travel_expense = ["Local Conveyance", "Ticket Allowance", "Tour Claim", "Conveyance Cost in Delhi"];
    for (var i = 0; i < travel_expense.length; i++) {
        if (doc.advance_type == travel_expense[i]) {
            flag = 1;
            break;
        }
    }
    
    /* In case of travel, End location is mandatory */
    if (flag && (!doc.end_location || doc.end_location <= 0))
        error += "- Row " + (idx + 1) + ": in case of any Travel, End Location is mandatory.<br>";

    return error;
}

function validate_tour_dates(start_date, end_date) {
    var err_str = "";
    if (!start_date || start_date.length <= 0 || !end_date || end_date.length <= 0) {
        err_str = "- Please enter Tour Start Date or End Date to proceed.<br>";
    } else {
        var sd = new Date(start_date);
        var ed = new Date(end_date);

        if (ed < sd) {
            err_str = "- Tour End Date cannot be before Tour Start Date.<br>";
        }
    }

    return err_str;
}

function add_to_comment(comment_str) {
    var t_comment_str = "";
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;
    t_comment_str = "Added on " + dateTime + "<br>";
    comment_str = t_comment_str + comment_str;
    // Deprecated
    // cur_frm.timeline.insert_comment(comment_str);
    
    /* Add comments ONLY if the orm is already saved */
    if (cur_frm.doc.__islocal) {
        frappe.show_alert({
            message:__(comment_str),
            indicator:'red'
        }, 8);
        return;
    }
    
    frappe.db.insert({
	    "doctype": "Comment",
	    "comment_type": "Comment",
	    "comment_by": frappe.session.user,
	    "content": comment_str,
	    "reference_doctype": cur_frm.doc.doctype,
	    "reference_name": cur_frm.doc.name
	});
}

frappe.ui.form.on('Employee Advance', {
	before_save	(frm) {
	    var error_message = "";
        var vresponse = "";
	    var row = 0;
        var travel_expense = ["Local Conveyance", "Ticket Allowance", "Tour Claim", "Conveyance Cost in Delhi", "Hotel/Room Accommodation"];
        var travel_expense_amount = 0;
        var other_expense_amount = 0;
        var expensed = 0;
	    // All business logic would sit here

        /* A preliminary Check for dates */
        vresponse = validate_tour_dates(frm.doc.tour_start_date, frm.doc.tour_end_date);
        if (vresponse.length > 0) {
            vresponse += "<br>";
            error_message += vresponse;
        }

        if (error_message.length > 0) {
            frappe.validated = false;
            frappe.throw(__(error_message));
        }
	    
	    /* In case of any advance type being Hotel/Room Accommodation, the room
	     * have to be calculated.
	     */
	    var tbl = frm.doc.advance_details;
	    for (row; row < tbl.length; row++) {

            /* Check if dates are in range or not */
            vresponse = validate_dates(row, tbl[row],
                                       frm.doc.tour_start_date,
                                       frm.doc.tour_end_date);
            if (vresponse.length > 0)
                error_message += vresponse;

            /* Iterate on each row and do the business logic thing */
            vresponse = validate_hotel_accomodation(row, tbl[row],
                                                     frm.doc.tour_start_date,
                                                     frm.doc.tour_end_date);
            if (vresponse.length > 0)
                error_message += vresponse;
                
            vresponse = validate_taxi(row, tbl[row]);
            if (vresponse.length > 0)
                error_message += vresponse;            

            vresponse = validate_for_GST_bills(row, tbl[row]);
            if (vresponse.length > 0)
                error_message += vresponse;

            vresponse = validate_travel_end_location(row, tbl[row]);
            if (vresponse.length > 0)
                error_message += vresponse;
            
            if (error_message.length <= 0) {
                /* calculate the totals */
                for (var j = 0; j < travel_expense.length; j++) {
                    if (tbl[row].advance_type == travel_expense[j]) {
                        travel_expense_amount += tbl[row].advance_amount;
                        expensed = 1;
                        break;
                    }
                }
                
                if (!expensed) {
                    other_expense_amount += tbl[row].advance_amount;
                } else
                    expensed = 0;
            } else {
                error_message += "<br>";
            }
	    }

        if (error_message.length > 0) {
            add_to_comment(error_message);
            frappe.validated = false;
            frappe.throw(__("Cannot save form. Please fix following errors.<br><br>" + error_message));
        } else {
            frm.doc.calculated_advance = (travel_expense_amount + other_expense_amount);
            /* In case the role is CEO, then don't update the Advance Amount if not 0 */
            var is_ceo = 0
            for(var i = 0; i < frappe.user_roles.length; i++) {
                if (frappe.user_roles[i] == "CEO")
                    is_ceo = 1;
            }
            
            if (!is_ceo) {
                frm.doc.advance_amount = (travel_expense_amount + other_expense_amount);
                cur_frm.toggle_enable("advance_amount", 0);
            } else {
                cur_frm.toggle_enable("advance_amount", 1);
                frappe.show_alert({
                    message:__('Advance Table modified; Being in CEO role Advance Amuont is no longer updated. Please update manually!'),
                    indicator:'red'
                }, 8);
            }
    
            frm.doc.travel_expense = travel_expense_amount;
            frm.doc.other_expense = other_expense_amount;
        }
	}, /* end of before_save */
	
	onload(frm) {
	    frm.set_query("advance_type", "advance_details", function() {
            return {
                "filters": { "advance_type": 1 }
            };
        });
	}
});

frappe.ui.form.on('Employee Advance Details', {
	advance_details_add(frm, cdt, cdn) {
        frappe.show_alert({
            message:__('If travel type is any travel, Do not forget to fill Start/End Date, Hotel Room rates etc.'),
            indicator:'red'
        }, 8);
        frappe.show_alert({
            message:__('If travel type is any other expense, do not forget the GST information area in case of GST invoices.'),
            indicator:'red'
        }, 8);
	}
})


frappe.ui.form.on('Task', {
	refresh(frm) {
		$(".indicator:before").css("height", "12px").css("width","12px");
	}
})



