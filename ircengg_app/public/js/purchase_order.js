frappe.ui.form.on('Purchase Order', {
	refresh(frm) {
	    frm.set_query('items','item_code',()=>{
	        return {
	            filters:[
	                [['series','in',['IRC-STORE-.YYYY.-.####','IRC-LAB-.YYYY.-.####','IRC-STNRY-.YYYY.-.####','IRC-SVC-.YYYY.-.####']]]
	            ]
	        };
	    });
		// your code here
	}
})