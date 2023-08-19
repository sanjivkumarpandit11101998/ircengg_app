import frappe
from erpnext.assets.doctype.asset_movement.asset_movement import AssetMovement


class transfer_asset_movement(AssetMovement):

    def on_submit(self):
        # frappe.msgprint('By')
        doc = self
        if doc.purpose == 'Transfer':
            for asst in doc.assets:
                frappe.db.set_value('Asset', asst.asset,
                                    {'custodian': asst.responsiblity,
                                    'location': asst.target_location},update_modified=False)

    def on_cancel(self):
        # frappe.msgprint('Hllo')
        doc = self
        if doc.purpose == 'Transfer':
            for asst in doc.assets:
                frappe.db.set_value('Asset', asst.asset,
                                    {'custodian': asst.from_employee,
                                    'location': asst.source_location},update_modified=False)