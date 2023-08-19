import frappe
import json
#  api
@frappe.whitelist()
def attendance_employee(data):
    payroll_detail=json.loads(data)
    unmarked_attendance=[]
    #frappe.msgprint(payroll_detail['end_date'])
    last_date = frappe.utils.get_last_day(payroll_detail['end_date']).day
    holiday=frappe.db.get_list('Holiday',filters=[['parent','=','HOLIDAY LIST 2023-24'],['holiday_date','between',[payroll_detail['start_date'],payroll_detail['end_date']]]],fields=['holiday_date'])
    h_date=[]
    for date in holiday:
        h_date.append(str(date.holiday_date))
    unmarked_attendance=[]
    for emp in payroll_detail['employees']:
        value=1
        att_date=len(frappe.db.get_list('Attendance',filters=[['status','=','Present'],['docstatus','=',1],['employee','=',emp['employee']],['attendance_date','between',[payroll_detail['start_date'],payroll_detail['end_date']]]]))
        h_attendance=len(frappe.db.get_list('Attendance',filters=[['status','=','Present'],['employee','=',emp['employee']],['attendance_date','in',h_date],['docstatus','=',1]]))
        absent_days=last_date+h_attendance-len(h_date)-att_date
        if (absent_days):
            unmarked_attendance.append(json.loads(json.dumps({'employee':emp['employee'],'unmarked_days':absent_days})))
    frappe.msgprint(len(h_date))
    frappe.response['message'] = unmarked_attendance

@frappe.whitelist()
def email_attendance_link(doc):
    # frappe.msgprint(str(json.loads(doc)['email_id']))
    frappe.sendmail(
        recipients=json.loads(doc)['email_id'],
        subject='Attendance Link',
        message='https://script.google.com/macros/s/AKfycbz0zI4dWJos0qpkGfUmZ9qb4EVkqYFh-jx-bP_DHhcqTrvJAzM/exec',
        header='Attendance Link'
    )
    frappe.msgprint('Attendance Link Sent to '+json.loads(frappe.form_dict.data)['email_id']);

def attendance_leave(doc,before_submit):
    if doc.attendance_request and not doc.site_name:
        site_name=frappe.db.get_value('Attendance Request',doc.attendance_request,'site_name')
        doc.site_name=site_name
    # if doc.attendance_request and not doc.site_name:
    #     site_name=frappe.db.get_value('Attendance Request',doc.attendance_request,'site_name')
    #     doc.site_name=site_name
    # if(doc.status=='On Leave'):
    #     if not doc.leave_type:
    #         frappe.throw('Please fill Leave Type')
    # if(doc.employment_type== "Full-time"):
    #     if(doc.status=='On Leave' and doc.leave_type== 'Earned Leave'):
    #         #{doc.employee}{doc.attendance_date}{doc.attendance_date}
    #         leave=frappe.db.get_list('Leave Ledger Entry',filters=[['employee','=',doc.employee],['leave_type','=','Casual Leave'],['from_date','between',['2022-04-01',doc.attendance_date]],['to_date','>=',doc.attendance_date]],fields=['leaves','leave_type'])
    #         sum=0
    #         for i in leave:
    #             sum = sum + i.leaves
    #         last_date = frappe.utils.get_last_day(doc.attendance_date)
    #         first_date=frappe.utils.get_first_day(doc.attendance_date)
    #         # log(first_date)
    #         l_app = frappe.db.get_list('Leave Application',filters=[['employee','=',doc.employee],['leave_type','=','Casual Leave'],['status','=','Open'],['to_date','between',[str(first_date),str(last_date)]],['from_date','between',[str(first_date),str(last_date)]]],fields=['total_leave_days'])
    #         # log(l_app)
    #         for i in l_app:
    #             sum=sum-i.total_leave_days
    #         [y1,m1,d1]=str(frappe.utils.nowdate()).split('-')
    #         [y2,m2,d2]=str(doc.attendance_date).split('-')
    #         if m1 == m2:
    #             sum=sum+2
    #         if(sum<=0):
    #             frappe.throw('No Casual Leave Left or Leave Allocation not allocated Select Leave Type as Leave Without Pay')
    #         else:
    #             frappe.get_doc(dict(
    #                 doctype = 'Leave Application',
    #                 company = "IRC Engineering",
    #                 employee = doc.employee,
    #                 leave_type = doc.leave_type,
    #                 from_date = doc.attendance_date,
    #                 to_date = doc.attendance_date,
    #                 leave_approver = "spushpa826@gmail.com",
    #                 status = "Open",
    #                 posting_date = doc.attendance_date,
    #             )).insert()
    #             frappe.msgprint("Leave Application Created")
    #     elif(doc.status == "Absent"):
    #         frappe.get_doc(dict(
    #         doctype = 'Leave Application',
    #         company = "IRC Engineering",
    #         employee = doc.employee,
    #         leave_type = "Leave Without Pay",
    #         from_date = doc.attendance_date,
    #         to_date = doc.attendance_date,
    #         leave_approver = "spushpa826@gmail.com",
    #         status = "Open",
    #         posting_date = doc.attendance_date,
    #         )).insert()
    #     elif(doc.status == "On Leave" and doc.leave_type== 'Leave Without Pay'):
    #         frappe.get_doc(dict(
    #         doctype = 'Leave Application',
    #         company = "IRC Engineering",
    #         employee = doc.employee,
    #         leave_type = "Leave Without Pay",
    #         from_date = doc.attendance_date,
    #         to_date = doc.attendance_date,
    #         leave_approver = "spushpa826@gmail.com",
    #         status = "Open",
    #         posting_date = doc.attendance_date,
    #         )).insert()
    #         frappe.msgprint("Leave Application Created")


