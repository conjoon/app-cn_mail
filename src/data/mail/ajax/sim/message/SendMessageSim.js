/**
 * conjoon
 * (c) 2007-2019 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg/conjoon.org
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Ext.ux.ajax.SimManager hook for sending MessageDrafts
 */
Ext.define('conjoon.cn_mail.data.mail.ajax.sim.message.SendMessageSim', {

    requires : [
        'conjoon.cn_mail.data.mail.ajax.sim.Init',
        'conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable'
    ]

}, function() {

    Ext.ux.ajax.SimManager.register({
        type : 'json',

        url  : /cn_mail\/SendMessage(\/\d+)?/,

        doPost : function(ctx) {

            console.log("POST SendMessage", ctx.xhr.options);

            var me              = this,
                ret             = {},
                MessageTable    = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable,
                id              = ctx.xhr.options.params.id,
                mailAccountId   = ctx.xhr.options.params.mailAccountId,
                mailFolderId    = ctx.xhr.options.params.mailFolderId,
                draft           = MessageTable.getMessageDraft(mailAccountId, mailFolderId, id);


            if (draft.xCnDraftInfo) {
                let [accountId, folderId, id] = Ext.decode(atob(draft.xCnDraftInfo));
                let items = MessageTable.getMessageItems();
                for (let i = 0, len = items.length; i < len; i++) {
                    if (items[i].mailAccountId === accountId && items[i].id === id &&
                        items[i].mailFolderId === folderId) {
                        MessageTable.updateAllItemData(
                            items[i].mailAccountId, items[i].mailFolderId, items[i].id,
                            {answered : true});
                        break;
                    }
                }
            }

            if (draft['subject'] === 'SENDFAIL') {
                ret.responseText = Ext.JSON.encode({
                    success : false
                });
                return ret;
            }

            ret.responseText = Ext.JSON.encode({
                success       : true
            });

            Ext.Array.forEach(me.responseProps, function (prop) {
                if (prop in me) {
                    ret[prop] = me[prop];
                }
            });

            return ret;
        }
    });


});