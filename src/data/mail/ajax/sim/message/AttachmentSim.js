/**
 * conjoon
 * (c) 2007-2017 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2017 Thorsten Suckow-Homberg/conjoon.org
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
 * Ext.ux.ajax.SimManager hook for {@link conjoon.cn_mail.model.mail.message.ItemAttachment}
 * and {@link conjoon.cn_mail.model.mail.message.DraftAttachment}
 * data.
 */
Ext.define('conjoon.cn_mail.data.mail.ajax.sim.message.AttachmentSim', {

    requires : [
        'conjoon.cn_mail.data.mail.ajax.sim.Init',
        'conjoon.cn_mail.data.mail.ajax.sim.message.AttachmentTable'
    ]

}, function() {

    var AttachmentTable = conjoon.cn_mail.data.mail.ajax.sim.message.AttachmentTable;

    Ext.ux.ajax.SimManager.register({
        type : 'json',

        url  : /cn_mail\/Attachment(\/\d+)?/,

        doDelete : function(ctx) {

            console.log("DELETE Attachment", ctx.xhr.options);

            var me  = this,
                id  = ctx.url.match(this.url)[1].substring(1);
                ret = {};

            AttachmentTable.deleteAttachment(id);

            ret.responseText = Ext.JSON.encode({
                success :true
            });

            Ext.Array.forEach(me.responseProps, function (prop) {
                if (prop in me) {
                    ret[prop] = me[prop];
                }
            });
            return ret;

        },

        doPost : function(ctx) {

            console.log("POST Attachment", ctx.xhr.options.formData.entries());

            var me         = this,
                attachment = {},
                rec        = {},
                ret        = {};

            for (var i in ctx.xhr.options.jsonData) {
                if (!ctx.xhr.options.jsonData.hasOwnProperty(i)) {
                    continue;
                }

                attachment[i] = ctx.xhr.options.jsonData[i];
            }

            rec = AttachmentTable.createAttachment(attachment);

            ret.responseText = Ext.JSON.encode({
                id : rec.id,
                success :true
            });

            Ext.Array.forEach(me.responseProps, function (prop) {
                if (prop in me) {
                    ret[prop] = me[prop];
                }
            });
            return ret;
        },

        data: function(ctx) {

            var idPart  = ctx.url.match(this.url)[1],
                filters = ctx.params.filter,
                id, attachments;
            if (idPart) {
                id = parseInt(idPart.substring(1), 10);
                console.log("GET", "Attachment", id, new Date());
                return AttachmenTable.getAttachment(id);
            } else if (filters) {
                filters = Ext.decode(filters);
                id      = filters[0].value;
                attachments = AttachmentTable.getAttachments(id);


                return attachments;
            } else {
                return [{text : "NOT SUPPORTED"}];
            }
        }
    });

});