# Copyright (c) 2023, IRC Engg and contributors
# For license information, please see license.txt

from frappe.model.document import Document

import frappe
import json

class ItemsAssetMovement(Document):

    def on_submit(self):
        doc = self
        assets = []
        # frappe.msgprint('Hllo')
        consumable_items = []
        if doc.asset_items:
            for asset in doc.asset_items:
                asset_detail = {
                    'asset': asset.asset,
                    'source_location': asset.from_location,
                    'target_location': asset.to_location,
                    'responsiblity': asset.to_employee,
                    'from_employee': asset.from_employee,
                    # 'transfer_quantity': asset.quantity
                }
                assets.append(asset_detail)
            # frappe.msgprint('Hllo')
            asset_movement = frappe.get_doc({
                'doctype': 'Asset Movement',
                'transaction_date': doc.transaction_date,
                'purpose': 'Transfer',
                'site_name': doc.site_name,
                'destination': doc.destination,
                'site_incharge': doc.site_incharge,
                'challan_no': doc.name,
                'assets': assets,
            })
            # asset_movement.insert()
            asset_movement.submit()
        if doc.consumable_items:
            if doc.transfer_type == 'Site To Site':
                value = str(doc.site_name) + ',' \
                    + str(frappe.db.get_value('Stock Entry',
                          {'challan_no': doc.store_challan_no}, 'site_name'
                    ))
                challan_no = frappe.db.set_value('Stock Entry',
                                                 {'challan_no': doc.store_challan_no}, 'site_name',
                                                 value)
            elif doc.transfer_type == 'Store To Site':
                for item in doc.consumable_items:
                    item_detail = {
                        'item_code': item.item,
                        's_warehouse': 'Stores - '+'IRC',
                        't_warehouse': 'Site - '+'IRC',
                        'qty': item.quantity,
                    }
                    consumable_items.append(item_detail)
                consumable_movement = frappe.get_doc({
                    'doctype': 'Stock Entry',
                    'stock_entry_type': 'Material Transfer',
                    'items': consumable_items,
                    'site_name': doc.site_name,
                    'challan_no': doc.name,
                })
                    # consumable_movement.insert()
                consumable_movement.submit()
            elif doc.transfer_type == 'Site To Store':
                for item in doc.consumable_items:
                    item_detail = {
                        'item_code': item.item,
                        's_warehouse': 'Site - '+'IRC',
                        't_warehouse': 'Stores - '+'IRC',
                        'uom': item.uom,
                        'conversion_factor': item.conversion_factor,
                        'qty': item.quantity,
                    }
                    consumable_items.append(item_detail)
                consumable_movement = frappe.get_doc({
                    'doctype': 'Stock Entry',
                    'stock_entry_type': 'Material Transfer',
                    'items': consumable_items,
                    'site_name': doc.site_name,
                    'challan_no': doc.name,
                })
            # consumable_movement.insert()
                consumable_movement.submit()
                

@frappe.whitelist()
def get_non_return_asset(val_data):
    # frappe.msgprint('Hii')
    ast_itm=[]
    csm_itm=[]
    data=json.loads(val_data)
    tf_ch_lst=frappe.db.get_list('Items Asset Movement',filters={'challan_no':data['challan_no'],'docstatus':1},fields=['name'])
    if(tf_ch_lst):
        for ch_no in tf_ch_lst:
            ast_itm=ast_itm+frappe.db.get_list('Asset Items',filters={'parent':ch_no.name},pluck='asset')
            csm_itm=csm_itm+frappe.db.get_list('Consumable Items',filters={'parent':ch_no.name},pluck='item')
    ast_ch_itm=frappe.db.get_list('Asset Items',filters=[['parent','=',data['challan_no']],['asset','not in',ast_itm]],fields=['asset','transfer_quantity'])
    csm_ch_itm=frappe.db.get_list('Consumable Items',filters=[['parent','=',data['challan_no']],['item','not in',csm_itm]],fields=['item','quantity','to_location','to_employee','item_description'])
    frappe.response['message'] = [ast_ch_itm,csm_ch_itm]