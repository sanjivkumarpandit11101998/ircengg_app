
var distance_from_selected_site;
var img_urls=[];
var file
function save_image(frm, data_urls) {
    // console.log(data_urls)
    data_urls.forEach(data_url => {
        let filename = `capture_${frappe.datetime.now_datetime().replaceAll(/[: -]/g, '_')}.png`;
        // console.log(data_url)
        url_to_file(data_url, filename, 'image/png').then((f) => {
            file = f;
            let form_data = new FormData();
            // console.log(file);
            form_data.append('file', file, file.name);
            form_data.append('is_private', 0);
            form_data.append('doctype', 'Employee Checkin');
            form_data.append('docname', frm.doc.name);
            fetch('/api/method/upload_file', {
                headers: {
                    'X-Frappe-CSRF-Token': frappe.csrf_token
                },
                method: 'POST',
                body: form_data
            }).then(res => {
                res.json().then((img_val)=>{
                        frappe.db.set_value('Employee Checkin', frm.doc.name, 'attach_link', window.location.origin+'/'+img_val.message.file_url).then(()=>{
                            frm.save()
                            frm.refresh()
                        })
                    });
                    // frappe.db.set_value('Employee Checkin', frm.doc.name, 'attach', img_val.message.file_url)
                })
            });
        });
    

    function url_to_file(url, filename, mime_type) {
        return fetch(url)
            .then(res => res.arrayBuffer())
            .then(buffer => new File([buffer], filename, {
                type: mime_type
            }));
    }
}

function distance_calculate(lat1, long1, lat2, long2) {
    let startingLat = Math.PI * lat1 / 180;
    let startingLong = Math.PI * long1 / 180;
    let destinationLat = Math.PI * lat2 / 180;
    let destinationLong = Math.PI * long2 / 180;
    let radius = 6371; // Corrected radius value (approximate Earth radius in kilometer
    // Haversine equation
    return Math.acos(Math.sin(startingLat) * Math.sin(destinationLat) +
        Math.cos(startingLat) * Math.cos(destinationLat) *
        Math.cos(startingLong - destinationLong)) * radius;

}
frappe.ui.form.on('Employee Checkin', {
    refresh(frm) {
        // frappe.msgprint('hii')
        // frappe.db.get_value('File', { 'attached_to_name': cur_frm.doc.name }, ['file_url']).then((img) => {
        //     // console.log(img);
        //     if (img) {
        //         // console.log(img);
        //         $('#image_preview').attr("src", `http://62.171.143.95:8001/${img.message.file_url}`);
        //         //$('#image_preview').attr("src",`https://spa01.ampower.cloud/files/capture_2023_07_24_14_40_40.png`);
        //     }
        // })
        frm.doc.__islocal!=1?$('#image_preview').attr("src", frm.doc.attach_link):'';
        let details = navigator.userAgent;
        let regexp = /android|iphone|kindle|ipad/i;
        let isMobileDevice = regexp.test(details);
        if (isMobileDevice) {
            frm.set_df_property('take_image', 'hidden', 1)
        } else {
            frm.set_df_property('image', 'hidden', 1)
        }
        document.getElementById(frm.doc.name).addEventListener("change", function(event) {
            // console.log('hii')
            var imagePreview = document.getElementById('image_preview')
            const selectedFile = event.target.files[0];
            // console.log(selectedFile)
            if (selectedFile) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    img_urls=[]
                    frappe.msgprint(e.target.result)
                    img_urls.push(e.target.result)
                    imagePreview.src = e.target.result;
                };
                reader.readAsDataURL(selectedFile);
            } else {
                imagePreview.src = '#';
            }
        });

        // your code here

        function onPositionRecieved(position) {
            var longitude = position.coords.longitude;
            var latitude = position.coords.latitude;
            frm.set_value('longitude', longitude);
            frm.set_value('latitude', latitude);
            fetch('https://api.opencagedata.com/geocode/v1/json?q=' + latitude + '+' + longitude + '&key=de1bf3be66b546b89645e500ec3a3a28')
                .then(response => response.json())
                .then(data => {
                    var city = data['results'][0].components.city;
                    var state = data['results'][0].components.state;
                    var area = data['results'][0].components.residential;
                    frm.set_value('city', city);
                    frm.set_value('state', state);
                    frm.set_value('area', area);
                    frm.trigger('calculate_distance').then(() => {
                        frm.trigger('apply_filter_on_site');
                    })
                })
                .catch(err => console.log(err));
            frm.set_df_property('my_location', 'options', '<div class="mapouter"><div class="gmap_canvas"><iframe width=100% height="300" id="gmap_canvas" src="https://maps.google.com/maps?q=' + latitude + ',' + longitude + '&t=&z=17&ie=UTF8&iwloc=&output=embed" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe><a href="https://yt2.org/youtube-to-mp3-ALeKk00qEW0sxByTDSpzaRvl8WxdMAeMytQ1611842368056QMMlSYKLwAsWUsAfLipqwCA2ahUKEwiikKDe5L7uAhVFCuwKHUuFBoYQ8tMDegUAQCSAQCYAQCqAQdnd3Mtd2l6"></a><br><style>.mapouter{position:relative;text-align:right;height:300px;width:100%;}</style><style>.gmap_canvas {overflow:hidden;background:none!important;height:300px;width:100%;}</style></div></div>');
            frm.refresh_field('my_location');
        }

        function locationNotRecieved(positionError) {
            frappe.throw(positionError)
        }

        if (frm.doc.longitude && frm.doc.latitude) {
            frm.set_df_property('my_location', 'options', '<div class="mapouter"><div class="gmap_canvas"><iframe width=100% height="300" id="gmap_canvas" src="https://maps.google.com/maps?q=' + frm.doc.latitude + ',' + frm.doc.longitude + '&t=&z=17&ie=UTF8&iwloc=&output=embed" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe><a href="https://yt2.org/youtube-to-mp3-ALeKk00qEW0sxByTDSpzaRvl8WxdMAeMytQ1611842368056QMMlSYKLwAsWUsAfLipqwCA2ahUKEwiikKDe5L7uAhVFCuwKHUuFBoYQ8tMDegUAQCSAQCYAQCqAQdnd3Mtd2l6"></a><br><style>.mapouter{position:relative;text-align:right;height:300px;width:100%;}</style><style>.gmap_canvas {overflow:hidden;background:none!important;height:300px;width:100%;}</style></div></div>');
            frm.refresh_field('my_location');
        } else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(onPositionRecieved, locationNotRecieved, { enableHighAccuracy: true });
            }
        }


    },
    location(frm) {
        frm.trigger('apply_filter_on_site');
        if (frm.doc.location == "Office") {
            frm.set_df_property("site_name", "label", "Office Name");
        } else {
            frm.set_df_property("site_name", "label", "Site Name");
        }
    },
    before_save: async (frm) => {
        //........................................................................................................................................................................
        if (frm.doc.__islocal) {
            if (img_urls.length==0 && frm.doc.log_type == 'IN') {
                frappe.throw('Please Add Image')
            }
            frm.set_value('area', distance_from_selected_site);
            let promise = new Promise((resolve, reject) => {
                if (distance_from_selected_site > 10 && (frm.doc.location == 'On Site(Not Working)' || frm.doc.location == 'On Site(Working)' || frm.doc.location == 'Office')) {

                    frappe.confirm(
                        `<h4 style="color:red;">Warning</h4>\nYou Are Not On Designated Location`,
                        () => {
                            resolve();
                        },
                        () => {
                            //  frappe.msgprint('Attendance Not Marked');
                            reject();
                        }
                    );
                }
                else {
                    resolve();
                }
            });
            await promise.catch(() => frappe.throw('Attendance Not Marked'));
        }
        //.........................................................................................................................................
        // if(frm.doc.location!='Travelling'||frm.doc.location!='Meeting')
        // {
        //     if(distance_from_selected_site>10)
        //     {
        //         frappe.confirm('`<h4 style="color:red;">Warning</h4>\nYou Are Not On Designated Location ${distance_from_selected_site}`',
        //             () => {
        //                 // action to perform if Yes is selected
        //                 frappe.msgprint('Attendance Marked');
        //             }, () => {
        //                 frappe.msgprint('Attendance Not Marked');
        //                 frappe.validated=false;
        //                 // action to perform if No is selected
        //             });
        //     }
        // }
        
    },
    site_name(frm) {
        frm.trigger('calculate_distance');
        frm.refresh()
    },
    calculate_distance(frm) {
        if (frm.doc.site_name) {
            var lat_long = frappe.db.get_value('Site Name', cur_frm.doc.site_name, ['latitude', 'longitude']).then((v) => {
                // console.log(v.message.latitude)
                distance_from_selected_site = distance_calculate(v.message.latitude, v.message.longitude, frm.doc.latitude, frm.doc.longitude);
            });
        }
    },
    apply_filter_on_site(frm) {
        var all_site = [];
        var filter_site = [];
        frappe.db.get_list("Site Name", {
            filters: { "is_running_site": 1 },
            fields: ['latitude', 'longitude', 'site_name']
        }).then((allsite) => {
            allsite.map((site) => {
                all_site.push(site.site_name);
                var distanceInKilometers = distance_calculate(site.latitude, site.longitude, frm.doc.latitude, frm.doc.longitude)
                if (distanceInKilometers < 20) {
                    filter_site.push(site.site_name);
                }
            });
        });
        frm.set_query("site_name", function () {
            if (filter_site.length > 0 && frm.doc.location !== "Travelling") {
                return {
                    "filters": [
                        ["Site Name", "site_name", "in", filter_site]]
                };
            } else {
                return {};
            }
        });
    },
    after_save(frm) {
        // console.log(img_urls)
        save_image(frm, img_urls)
    },
    take_image: function (frm) {
        
        const capture = new frappe.ui.Capture({
            title: __('Capture Image'),
            animate: false,
            error: true,
        });
        capture.submit((data_urls) => {
            // console.log(data_urls);
            img_urls = data_urls;
            $('#image_preview').attr("src", data_urls[0]);
        })
        capture.show();
    }

})

function takeImage(frm) {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.setAttribute('capture', 'camera');

    input.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const dataUrl = e.target.result;
                img_urls = [dataUrl];
                $('#image_preview').attr('src', dataUrl);
            };
            reader.readAsDataURL(file);
        }
    });

    input.click();
}



// function checkAttachFieldVisibility(frm) {
//     var doc = frm.doc;
//     var attachField = frm.fields_dict['image']; // Replace 'attach' with the actual fieldname of the "Attach" field

//     if (doc.site_name && doc.site_name !== '') {
//         // If the 'site_name' field has a value, make the "Attach" field visible and mandatory
//         attachField.df.hidden = 0;
//         frm.refresh_field('image');
//     } else {
//         // If the 'site_name' field does not have a value, hide the "Attach" field and make it non-mandatory
//         attachField.df.hidden = 1;

//         frm.refresh_field('image');
//     }
// }




//# sourceURL=employee_checkin__js

