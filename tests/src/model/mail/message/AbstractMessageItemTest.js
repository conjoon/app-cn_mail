/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2020 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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

describe('conjoon.cn_mail.model.mail.message.AbstractMessageItemTest', function(t) {

    var model,
        messageBody;

    t.beforeEach(function() {

        messageBody = Ext.create('conjoon.cn_mail.model.mail.message.MessageBody', {
            id : "foo-1"
        });

        model = Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
            id            : "foo-1",
            messageBodyId : "foo-1",
            mailAccountId : "foo",
            mailFolderId  : "INBOX.Drafts",
            originalId    : "1"
        });


    });

    t.afterEach(function() {
        model       = null;
        messageBody = null;
    });


// +----------------------------------------------------------------------------
// |                    =~. Unit Tests .~=
// +----------------------------------------------------------------------------

    t.it("Should create instance", function(t) {
        t.isInstanceOf(model, 'conjoon.cn_mail.model.mail.message.CompoundKeyedModel');
    });

    t.it("Test Record Validity", function(t) {
        t.expect(model.isValid()).toBe(true);
    });

    t.it("Test getMessageBody", function(t) {
        model.setMessageBody(messageBody);
        t.expect(model.getMessageBody()).toBeTruthy();
        t.expect(model.getField('messageBodyId').persist).toBe(false);
        t.expect(model.getField('messageBodyId').unique).toBe(true);
    });

    t.it("Test date", function(t) {
        t.expect(model.getField('date')).toBeTruthy();
        t.expect(model.getField('date').getDateReadFormat()).toBe("Y-m-d H:i:s O");
    });

    t.it("Test seen", function(t) {
        t.expect(model.getField('seen')).toBeTruthy();
    });

    t.it("Test recent", function(t) {
        t.expect(model.getField('recent')).toBeTruthy();
    });

    t.it("Test flagged", function(t) {
        t.expect(model.getField('flagged')).toBeTruthy();
    });

    t.it("Test answered", function(t) {
        t.expect(model.getField('answered')).toBeTruthy();
    });

    t.it("Test draft", function(t) {
        t.expect(model.getField('draft')).toBeTruthy();
    });

    t.it("Test mailFolderId", function(t) {
        t.expect(model.getField('mailFolderId')).toBeTruthy();
        t.expect(model.getField('mailFolderId').critical).toBe(true);
    });

    t.it("Test mailAccountId", function(t) {
        t.expect(model.getField('mailAccountId')).toBeTruthy();
        t.expect(model.getField('mailAccountId').critical).toBe(true);
    });

    t.it("Test id", function(t) {
        t.expect(model.getField('id')).toBeTruthy();
        t.expect(model.getField('id').critical).toBe(true);
    });

    t.it("localId", function(t) {
        t.expect(model.getIdProperty()).toBe('localId');
    });

    t.it("loadAttachments()", function(t) {
        t.isInstanceOf(model.attachments(), 'conjoon.cn_mail.store.mail.message.MessageAttachmentStore');

        t.isCalled('load', model.attachments());

        t.expect(model.attachments().getFilters().length).toBe(1);
        model.loadAttachments();
        model.loadAttachments();
        t.expect(model.attachments().getFilters().length).toBe(3);

        let filters = model.attachments().getFilters(), filter;

        filter = filters.getAt(0);
        t.expect(filter.getProperty()).toBe('mailAccountId');
        t.expect(filter.getValue()).toBeTruthy();

        filter = filters.getAt(1);
        t.expect(filter.getProperty()).toBe('mailFolderId');
        t.expect(filter.getValue()).toBeTruthy();

        filter = filters.getAt(2);
        t.expect(filter.getProperty()).toBe('parentMessageItemId');
        t.expect(filter.getValue()).toBeTruthy();

    });


    t.it("loadMessageBody()", function(t) {
        t.isCalled('getMessageBody', model);

        let CALLED = 0,
            options = {callback : function(){CALLED++;}};

        model.loadMessageBody(options);

        t.expect(model.get('mailAccountId')).toBeTruthy();
        t.expect(model.get('mailFolderId')).toBeTruthy();

        t.expect(options.params.mailAccountId).toBe(model.get('mailAccountId'));
        t.expect(options.params.mailFolderId).toBe(model.get('mailFolderId'));
        t.expect(options.params.id).toBe(model.get('id'));
        t.expect(options.params.parentMessageItemId).toBeFalsy();

        t.waitForMs(250, function() {
            t.expect(CALLED).toBe(1);
        });
    });


    t.it("loadMessageBody() - exception", function(t) {

        let exc, e;

        t.isntCalled('getMessageBody', model);

        t.expect(model.get('mailAccountId')).toBeTruthy();
        model.set('mailAccountId', undefined);
        t.expect(model.get('mailFolderId')).toBeTruthy();

        try{model.loadMessageBody()}catch(e){exc=e;};

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("compound keys missing");
    });


    t.it("getAssociatedCompoundKeyedData()", function(t) {

        t.expect(model.getAssociatedCompoundKeyedData()).toEqual([]);

        model.loadMessageBody();

        t.waitForMs(250, function() {
            t.expect(model.getAssociatedCompoundKeyedData().length).toBe(1);
            t.expect(model.getAssociatedCompoundKeyedData()[0]).toBe(model.getMessageBody());
        });
    });


    t.it("getAssociatedCompoundKeyedData() - 2",  function(t) {

        let att, body;

        att = Ext.create("conjoon.cn_mail.model.mail.message.ItemAttachment");
        body = Ext.create("conjoon.cn_mail.model.mail.message.MessageBody");

        model.attachments().add(att);
        model.setMessageBody(body);

        t.expect(model.getAssociatedCompoundKeyedData()).toContain(att);
        t.expect(model.getAssociatedCompoundKeyedData()).toContain(body);

    });


    t.it("onAssociatedRecordSet() - MessageBody", function(t) {

        t.isCalled('processRecordAssociation', model);
        model.onAssociatedRecordSet(messageBody);

    });


    t.it("processRecordAssociation() - MessageBody", function(t) {

        t.isCalled('compareAndApplyCompoundKeys', model);
        model.processRecordAssociation(messageBody);

    });


    t.it("processRecordAssociation() - no MessageBody", function(t) {

        t.isntCalled('compareAndApplyCompoundKeys', model);
        model.processRecordAssociation(Ext.create("Ext.data.Model"));

    });

});
