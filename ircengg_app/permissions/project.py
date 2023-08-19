import frappe
def project_user_conditions(user):
    role = frappe.db.get_value("User", frappe.session.user, "role_profile_name")
    
    if role not in ['CEO', 'Administrator', 'Sales Team']:
        return f"project_manager = '{frappe.session.user}' or site_incharge = '{frappe.session.user}' "
    else:
        return ""