import frappe
def update_task_conditions(user):
    role = frappe.db.get_value("User", frappe.session.user, "role_profile_name")

    if role not in ['CEO', 'Administrator', 'Sales Team']:
        project_list = frappe.db.get_list("Project", {'project_manager': frappe.session.user}, pluck="name")
        user = "%" + frappe.session.user + "%"

        if len(project_list) == 1:
            project_value = project_list[0]
            return f"_assign LIKE '{user}' or project = '{project_value}'"
        elif project_list:
            project_value = tuple(project_list)
            return f"_assign LIKE '{user}' or project IN {project_value}"
        else:
            project_value = 'null'
            return f"_assign LIKE '{user}' or project = 'null'"