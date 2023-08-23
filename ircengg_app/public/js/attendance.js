// frappe.ui.form.on('Attendance', {
// 	refresh(frm) {
// 	    console.log(frm);

//     let imageSrc = frm.doc.image;
//       console.log(imageSrc);

//     $('#image_preview').attr("src",imageSrc);
// 		// your code here
// 	}
// })

frappe.ui.form.on('Attendance', {
	refresh(frm) {

		frappe.db.get_value('Employee Checkin', { 'attendance': cur_frm.doc.name, 'log_type': 'IN' }, 'name').then((id) => {
			console.log(id)
			frappe.db.get_value('File', { 'attached_to_name': id.message.name }, ['file_url']).then((img) => {

				console.log(img);
				if (img) {
					console.log(img);
					$('#image_preview').attr("src", `http://62.171.143.95:8001/${img.message.file_url}`);
				}
			})
		})
		frm.set_df_property('my_location', 'options', '<div class="mapouter"><div class="gmap_canvas"><iframe width=100% height="300" id="gmap_canvas" src="https://maps.google.com/maps?q=' + cur_frm.doc.latitude + ',' + frm.doc.longitude + '&t=&z=17&ie=UTF8&iwloc=&output=embed" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe><a href="https://yt2.org/youtube-to-mp3-ALeKk00qEW0sxByTDSpzaRvl8WxdMAeMytQ1611842368056QMMlSYKLwAsWUsAfLipqwCA2ahUKEwiikKDe5L7uAhVFCuwKHUuFBoYQ8tMDegUAQCSAQCYAQCqAQdnd3Mtd2l6"></a><br><style>.mapouter{position:relative;text-align:right;height:300px;width:100%;}</style><style>.gmap_canvas {overflow:hidden;background:none!important;height:300px;width:100%;}</style></div></div>');
		frm.refresh_field('my_location');


	}
})

