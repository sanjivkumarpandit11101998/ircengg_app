frappe.ui.form.on('Attendance', {
	refresh(frm) {
	    console.log(frm);
    
    let imageSrc = frm.doc.image;
      console.log(imageSrc);
    
    $('#image_preview').attr("src",imageSrc);
		// your code here
	}
})