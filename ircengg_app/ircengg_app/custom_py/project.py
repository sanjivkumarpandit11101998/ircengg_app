import frappe
# Project event
def task_dependency(self,on_update):
    doc=self
    # frappe.msgprint("hii")
    if (doc.project_template and doc.is_new()==False):
        task_in_template_list=frappe.db.get_list("Project Template Task",  filters={"parent":doc.project_template}, fields=["task","subject"])
        for dependent in task_in_template_list:
            task_of_project=frappe.db.get_value('Task', {"project": doc.name,"subject":dependent.subject},['name','subject'])
            # frappe.msgprint(str(task_of_project[0]))
            if doc.sales_order:
                required_task=frappe.db.get_list('Task Requirement',filters={'parent':doc.sales_order},pluck='subject')
                if task_of_project[1] not in required_task:
                    # frappe.msgprint(str(task_of_project[0]))
                    frappe.db.set_value('Task',task_of_project[0],{'status':'Cancelled'},update_modified=False)
                    continue
            depends=frappe.db.get_list("Task Depends On",  filters={"parent":dependent.task},pluck="task")
            before_project_days=frappe.db.get_value('Task',dependent.task,['before_project_days','expected_time'])
            if len(depends)==0:
                fetch_site_incharge=frappe.db.get_value('Task',dependent.task,'fetch_site_incharge')
                # frappe.msgprint(str(fetch_site_incharge))
                if fetch_site_incharge:
                    doer=[str(doc.site_incharge)]
                else:
                    doer=frappe.db.get_list("User child table",  filters= {"parent":dependent.task}, pluck='user')
                # frappe.msgprint(str(doer))
                task_value=frappe.get_doc('Task', dependent.task,'before_project_days')
                end_date=frappe.db.get_value('Task', {"project": doc.name,"subject":dependent.subject},'exp_end_date')
                frappe.db.set_value('Task',task_of_project[0],{'exp_start_date':frappe.utils.add_days(doc.expected_start_date,before_project_days[0]),'expected_time':before_project_days[1]},update_modified=False)
                frappe.db.set_value('Task',task_of_project[0],'exp_end_date',frappe.utils.add_days(end_date,before_project_days[0]),update_modified=False)
                # frappe.msgprint(str(task_of_project[0]))
                for assign in doer:
                    frappe.get_doc({
                            "doctype": "ToDo",
                            "description": task_value.description,
                            "reference_type":"Task",
                            "reference_name":task_of_project[0],
                            "owner":assign,
                            "assigned_by":task_value.owner,
                            "allocated_to":assign,
                            "date":end_date
                        }).save()
                    # frappe.msgprint(str(task_of_project[0]))
            else:
                # task_of_project=frappe.db.get_value('Task', {"project": doc.name,"subject":dependent.subject},['name'])
                # frappe.msgprint(str(task_of_project[0]))
                frappe.db.set_value('Task',task_of_project[0],{'exp_start_date':None,'expected_time':before_project_days[1]},update_modified=False)
                frappe.db.set_value('Task',task_of_project[0],{'exp_end_date':None,'expected_time':before_project_days[1]},update_modified=False)



