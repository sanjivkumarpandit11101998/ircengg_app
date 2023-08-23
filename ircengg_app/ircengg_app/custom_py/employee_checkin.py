import frappe 
def fetch_data(self,before_submit):
    doc=self
    if(doc.status=='Present'):
        attendance_data = frappe.db.get_value('Employee Checkin',{'employee':doc.employee,'time':doc.in_time},['site_name','location','latitude','longitude','current_location','city','state','area'])
        frappe.msgprint(str(attendance_data))
        doc.site_name=attendance_data[0]
        doc.location=attendance_data[1]
        doc.latitude=attendance_data[2]
        doc.longitude=attendance_data[3]
        doc.current_location=attendance_data[4]
        doc.city=attendance_data[5]
        doc.state=attendance_data[6]
        doc.area=float(attendance_data[7])
        if float(attendance_data[7]) > float(10):
            doc.validation="Yes"
        else:
            doc.validation='No'
        # doc.image=attendance_data[8   