import frappe
#sales order doc event
def sales_order(self, on_update):
    if len(self.tasks) < 1:
        return
    doc = self
    # frappe.msgprint("hlo")
    task_with_dependent = {}
    tasks = []
    add_task = ""
    for t in doc.tasks:
        tasks.append(str(t.task))
    # frappe.msgprint(str(tasks))
    task_with_dependent2 = {}
    parent_task_missing = ""
    task_template = frappe.db.get_list(
        "Project Template Task", filters= {"parent": doc.from_template}, pluck="task"
    )
    for tsk in task_template:
        dependent_task = frappe.db.get_list(
            "Task Depends On",  
            filters=[["task", "=", tsk], ["parent", "in", task_template]],
            pluck="parent",
        )
        task_with_dependent.update({tsk: dependent_task})
        a = 1
        if len(dependent_task) > 0:
            for task1 in dependent_task:
                if task1 in tasks:
                    a = 0
                    break
                add_task = (
                    frappe.utils.get_link_to_form("Task", task1) + ", " + add_task
                )
            if a == 1:
                dependent_tsk = frappe.utils.get_link_to_form("Task", tsk)
                frappe.throw(
                    f"Delete '{dependent_tsk}' task     or add any one of these Task     '{add_task}'"
                )

    def check_dependent(doc):
        # 	frappe.msgprint('Hii')
        def validate_dependencies(doc):
            for task in doc.tasks:
                task_details = frappe.get_doc("Task", task.task)
                if task_details.depends_on:
                    for dependency_task in task_details.depends_on:
                        if not check_dependent_task_presence(doc, dependency_task.task):
                            task_details_format = frappe.utils.get_link_to_form(
                                "Task", task_details.name
                            )
                            dependency_task_format = frappe.utils.get_link_to_form(
                                "Task", dependency_task.task
                            )
                            frappe.throw(
                                f"Task     '{task_details_format}'     depends on Task     {dependency_task_format}.     Please add Task     {dependency_task_format} to     the Tasks list."
                            )

        def check_dependent_task_presence(doc, task):
            for task_details in doc.tasks:
                if task_details.task == task:
                    return True
            return False
        validate_dependencies(doc)
    check_dependent(doc)
