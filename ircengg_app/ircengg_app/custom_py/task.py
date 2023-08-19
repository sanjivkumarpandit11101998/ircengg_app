import frappe
def task_assignment(self,on_update):
    doc=self
    # frappe.msgprint("hli")
    def create_todo(task,doc,subject):
        doer=frappe.db.get_list("User child table",  filters={"parent":task}, fields=['user'])
        duration=frappe.db.get_value('Task',{'status':'Template',"subject":subject},'duration')
        task_value=frappe.get_doc('Task', task)
        task_value.exp_start_date=doc.completed_on          #frappe.utils.today()
        task_value.exp_end_date=frappe.utils.add_days(doc.completed_on,duration)            #frappe.utils.today()
        task_value.save()
        for assign in doer:
            frappe.get_doc({
                "doctype":"ToDo",
                "description":task_value.description,
                "reference_type":"Task",
                "reference_name":task_value.name,
                "owner":assign.user,
                "assigned_by":task_value.owner,
                "date":task_value.exp_start_date
            }).save() 
    if doc.status == "Completed" or doc.status == "Cancelled":
        parent_tasks=frappe.db.get_list("Task Depends On",  filters={"task":doc.name},pluck="parent")
        for parent_task in parent_tasks:
            tasks=frappe.db.get_list("Task Depends On",  filters={"parent":parent_task},pluck="task")
            parent_status=frappe.db.get_value("Task",parent_task,"status")
            if parent_status!='Completed':
                count=0
                for task in tasks:
                    task_detail=frappe.db.get_value("Task",task,["status","_assign","Subject"])
                    # frappe.msgprint(task_detail[0])
                    if(task_detail[0]!='Completed' and not task_detail[1] and task!=doc.name):
                        if not frappe.db.get_value('ToDo',{'reference_name':task},'name'):
                            create_todo(task,doc,task_detail[2])
                        count=1
                if(count==0):
                    task_detail=frappe.db.get_value("Task",parent_task,["Subject"])
                    if not frappe.db.get_value('ToDo',{'reference_name':parent_task},'name'):
                        create_todo(parent_task,doc,task_detail)
    # doc.delete()  
def task_before_after_days(self,after_insert):
    doc=self
    # frappe.msgprint(str(doc.status))
    if doc.status != 'Template':
        exp_date=frappe.db.get_value('Project',doc.project,'expected_start_date')
        template_detail=frappe.db.get_value('Task',{'subject':doc.subject,'status':'Template'},['before_project_days','name','fetch_site_incharge'])
        site_incharge=frappe.db.get_value('Project',doc.project,'site_incharge')
        # frappe.msgprint(str(template_detail))
        # frappe.msgprint(str(site_incharge))
        if template_detail:
            if(template_detail[2]==1):
                # frappe.msgprint(str(site_incharge))
                doc.append('assign_to_doer', {
                        'user': site_incharge
                    }).save()
            elif(template_detail):
                doer=frappe.db.get_list("User child table",  filters={"parent":template_detail[1]},fields=['user'])
                # frappe.msgprint(str(doer))
                for d in doer:
                    doc.append('assign_to_doer', {
                        'user': str(d['user'])
                    }).save()
        else:
            if(doc.fetch_site_incharge==1):
                site_incharge=frappe.db.get_value('Project',doc.project,'site_incharge')
                doc.append('assign_to_doer', {
                        'user': site_incharge
                    }).save()




