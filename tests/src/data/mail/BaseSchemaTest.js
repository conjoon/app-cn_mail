/**
 * conjoon
 * (c) 2007-2018 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2018 Thorsten Suckow-Homberg/conjoon.org
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

describe('conjoon.cn_mail.data.mail.BaseSchemaTest', function(t) {

    t.requireOk('conjoon.cn_mail.model.mail.message.MessageItem', function(){
    t.requireOk('conjoon.cn_mail.model.mail.message.MessageDraft', function(){

        t.it("Should properly create the schema and check for default config", function(t) {

            var schema = Ext.create('conjoon.cn_mail.data.mail.BaseSchema');

            t.expect(schema instanceof conjoon.cn_core.data.schema.BaseSchema).toBe(true);

            t.expect(schema.alias).toContain('schema.cn_mail-mailbaseschema');

            t.expect(schema.getProxy() instanceof Ext.util.ObjectTemplate ).toBe(true);
            t.expect(schema.getProxy().template.type).toBe('rest');
            t.expect(schema.getNamespace()).toBe('conjoon.cn_mail.model.mail.');

            t.expect(schema.id).toBe('cn_mail-baseschema');

            t.expect(schema.getUrlPrefix()).toBe('cn_mail');
        });


        t.it("Make sure proxy for MessageDraft and MessageItem is of type MessageItemProxy", function(t) {

            var schema = Ext.create('conjoon.cn_mail.data.mail.BaseSchema');

            var ret = schema.constructProxy(conjoon.cn_mail.model.mail.message.MessageItem);

            t.expect(ret.type).toBe('cn_mail-mailmessageentityproxy');

            ret = schema.constructProxy(conjoon.cn_mail.model.mail.message.MessageDraft);

            t.expect(ret.type).toBe('cn_mail-mailmessageentityproxy');
        });


    });


})});
