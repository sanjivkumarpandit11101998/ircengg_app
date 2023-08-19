import frappe
import json
@frappe.whitelist()
def payroll_entry(data):
    doc=json.loads(data)
    # frappe.msgprint(str(frappe.form_dict.data))
    not_salary_slip_created_employees=[]
    employees=frappe.db.get_list('Employee',filters={'employment_type':'Full-time', 'status':'Active'},fields=['name','employee_name','designation','department'])
    for employee in employees:
        if not frappe.db.exists('Salary Slip',{"start_date":doc['start_date'], "end_date":doc['end_date'], "employee":employee.name, "docstatus":('!=',2)}):
            not_salary_slip_created_employees.append({'employee': employee.name, 'employee_name': employee.employee_name,"designation": employee.designation,"department": employee.department,"total_no_of_days": frappe.utils.getdate(doc['end_date']).day-frappe.utils.getdate(doc['start_date']).day+1})
    frappe.response['employees']=not_salary_slip_created_employees