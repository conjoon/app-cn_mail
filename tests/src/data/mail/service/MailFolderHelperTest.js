/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

describe('conjoon.cn_mail.data.mail.service.MailFolderHelperTest', function(t) {

    const ACCOUNTID = 'dev_sys_conjoon_org',
        createHelper = function(store) {

        return Ext.create('conjoon.cn_mail.data.mail.service.MailFolderHelper', {
            store : store === false ? undefined  : Ext.create('conjoon.cn_mail.store.mail.folder.MailFolderTreeStore',{
                autoLoad : true
            })
        });
    };


// -----------------------------------------------------------------------------
// |   Tests
// -----------------------------------------------------------------------------
t.requireOk('conjoon.dev.cn_mailsim.data.mail.PackageSim', function() {

    Ext.ux.ajax.SimManager.init({
        delay: 1
    });


    t.it("constructor()", function(t) {
        let exc, e, helper;

        try{helper = createHelper(false);}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");

        helper = createHelper();
        t.isInstanceOf(helper, 'conjoon.cn_mail.data.mail.service.MailFolderHelper');
        t.expect(helper.getStore()).toBeDefined();
        t.isInstanceOf(helper.getStore(), 'conjoon.cn_mail.store.mail.folder.MailFolderTreeStore');
    });


    t.it("getAccountNode()", function(t) {

        let helper = createHelper();

        t.waitForMs(500, function() {

            t.expect(helper.getAccountNode('foo')).toBe(null);

            t.isInstanceOf(helper.getAccountNode(ACCOUNTID), 'conjoon.cn_mail.model.mail.account.MailAccount');
        });
    });



    t.it("getMailFolderIdForType()", function(t) {

        let helper = createHelper(),
            exc, e;

        t.waitForMs(250, function() {
            t.expect(helper.getMailFolderIdForType(ACCOUNTID, 'foo')).toBeNull();
            t.expect(helper.getMailFolderIdForType("ACCOUNTID", conjoon.cn_mail.data.mail.folder.MailFolderTypes.INBOX)).toBe(null);
            t.expect(helper.getMailFolderIdForType(ACCOUNTID, conjoon.cn_mail.data.mail.folder.MailFolderTypes.INBOX)).toBe("INBOX");
            t.expect(helper.getMailFolderIdForType(ACCOUNTID, conjoon.cn_mail.data.mail.folder.MailFolderTypes.SENT)).toBe("INBOX.Sent Messages");
            t.expect(helper.getMailFolderIdForType(ACCOUNTID, conjoon.cn_mail.data.mail.folder.MailFolderTypes.JUNK)).toBe("INBOX.Junk");
            t.expect(helper.getMailFolderIdForType(ACCOUNTID, conjoon.cn_mail.data.mail.folder.MailFolderTypes.DRAFT)).toBe("INBOX.Drafts");
            t.expect(helper.getMailFolderIdForType(ACCOUNTID, conjoon.cn_mail.data.mail.folder.MailFolderTypes.TRASH)).toBe("INBOX.Trash");
        });

    });


    t.it("getMailFolder()", function(t) {

        let helper = createHelper();

        t.waitForMs(250, function() {
            t.expect(helper.getMailFolder(ACCOUNTID, 'foo')).toBeNull();

            t.isInstanceOf(helper.getMailFolder(ACCOUNTID, "INBOX"), 'conjoon.cn_mail.model.mail.folder.MailFolder');

            t.expect(helper.getMailFolder("ACCOUNTID", 'INBOX')).toBeNull();
        });

    });


    t.it("doesFolderBelongToAccount()", function(t) {

        let helper = createHelper(),
            exc, e;

        t.waitForMs(250, function() {
            t.expect(helper.doesFolderBelongToAccount('foo', ACCOUNTID)).toBe(false);
            t.expect(helper.doesFolderBelongToAccount("INBOX", "ACCOUNTID")).toBe(false);
            t.expect(helper.doesFolderBelongToAccount("INBOX", ACCOUNTID)).toBe(true);
        });


    });


});});