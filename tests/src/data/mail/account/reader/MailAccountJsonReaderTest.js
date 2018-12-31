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

describe('conjoon.cn_mail.view.mail.account.reader.MailAccountJsonReaderTest', function(t) {


    t.it("Should successfully create and test instance", function(t) {

        let reader = Ext.create('conjoon.cn_mail.data.mail.account.reader.MailAccountJsonReader', {

        });

        t.isInstanceOf(reader, 'Ext.data.reader.Json');

        t.expect(reader.getRootProperty()).toBe('data');

        t.expect(reader.getTypeProperty()).toBe('modelType');

        t.expect(reader.mailAccountModelClass).toBe('conjoon.cn_mail.model.mail.account.MailAccount');

        t.expect(reader.alias).toContain('reader.cn_mail-mailaccountjsonreader');

    });


    t.it("applyCompoundKey - exception", function(t) {

        let reader = Ext.create('conjoon.cn_mail.data.mail.account.reader.MailAccountJsonReader'),
            exc, e, data;

        try{reader.applyModelTypes(data);} catch(e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("malformed");
        exc = undefined;

        data = {};
        try{reader.applyModelTypes(data);} catch(e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("malformed");
        exc = undefined;

        data = {data : ""};
        try{reader.applyModelTypes(data);} catch(e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("malformed");
        exc = undefined;

    });


    t.it("applyModelTypes()", function(t) {

        let reader = Ext.create('conjoon.cn_mail.data.mail.account.reader.MailAccountJsonReader'),
            ret,
            data = {
                data : [{
                }]
            }, result = {
                data : [{
                    modelType : 'conjoon.cn_mail.model.mail.account.MailAccount',
                    type      : conjoon.cn_mail.data.mail.folder.MailFolderTypes.ACCOUNT
                }]
            };

        ret = reader.applyModelTypes(data);

        t.expect(ret).toEqual(result);

        data.data[0] = {};

        data = {data : data.data[0]};
        ret = reader.applyModelTypes(data);
        result = {data : result.data[0]};
        t.expect(ret).toEqual(result);


    });


    t.it("applyCompoundKey() - success false", function(t) {

        let reader = Ext.create('conjoon.cn_mail.data.mail.account.reader.MailAccountJsonReader');
        ret = reader.applyModelTypes({success : false});
        t.expect(ret).toEqual({success : false})
    });


    t.it("processHybridData()", function(t){

        let reader = Ext.create('conjoon.cn_mail.data.mail.account.reader.MailAccountJsonReader'),
            data = {
                data : [{
                    mailAccountId : 'foo',
                    id            : 'bar'
                }]
            },
            result = {
                data : [{
                    modelType  : 'conjoon.cn_mail.model.mail.folder.MailFolder',
                    mailAccountId : 'foo',
                    id            : 'bar',
                    localId       : 'foo-bar'
                }]
            };

        t.isCalledNTimes('peekFolder', reader, 1);

        t.expect(reader.processHybridData(data)).toEqual(result);
    });


});

