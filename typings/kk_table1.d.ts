/// <reference path="../node_modules/@types/xrm/index.d.ts" />
declare namespace Kk_table1Enum {
    const enum statecode {
        Active = 0,
        Inactive = 1,
    }

    const enum kk_approvalstate {
        No = 0,
        Yes = 1,
    }

    const enum statuscode {
        Draft = 1,
        Approved = 2,
        Inreview = 339870001,
        Inapproval = 339870002,
        Rejected = 339870003,
    }

}

declare namespace Kk_table1 {
    const EntityLogicalName: "kk_table1";

    const enum Attributes {
        createdby = "createdby",
        createdbyname = "createdbyname",
        createdbyyominame = "createdbyyominame",
        createdon = "createdon",
        createdonbehalfby = "createdonbehalfby",
        createdonbehalfbyname = "createdonbehalfbyname",
        createdonbehalfbyyominame = "createdonbehalfbyyominame",
        importsequencenumber = "importsequencenumber",
        kk_approvalstate = "kk_approvalstate",
        kk_iscustombutton = "kk_iscustombutton",
        kk_request = "kk_request",
        kk_table1id = "kk_table1id",
        modifiedby = "modifiedby",
        modifiedbyname = "modifiedbyname",
        modifiedbyyominame = "modifiedbyyominame",
        modifiedon = "modifiedon",
        modifiedonbehalfby = "modifiedonbehalfby",
        modifiedonbehalfbyname = "modifiedonbehalfbyname",
        modifiedonbehalfbyyominame = "modifiedonbehalfbyyominame",
        overriddencreatedon = "overriddencreatedon",
        ownerid = "ownerid",
        owneridname = "owneridname",
        owneridtype = "owneridtype",
        owneridyominame = "owneridyominame",
        owningbusinessunit = "owningbusinessunit",
        owningbusinessunitname = "owningbusinessunitname",
        owningteam = "owningteam",
        owninguser = "owninguser",
        statecode = "statecode",
        statuscode = "statuscode",
        timezoneruleversionnumber = "timezoneruleversionnumber",
        utcconversiontimezonecode = "utcconversiontimezonecode",
        versionnumber = "versionnumber",
    }

}

declare namespace Xrm {
    type Kk_table1 = Omit<FormContext, 'getAttribute'> & Omit<FormContext, 'getControl'> & Kk_table1Attributes;

    interface EventContext {
        getFormContext(): Kk_table1;
    }

    interface Kk_table1Attributes {
        getAttribute(name: "createdby"): Attributes.LookupAttribute;
        getAttribute(name: "createdbyname"): Attributes.StringAttribute;
        getAttribute(name: "createdbyyominame"): Attributes.StringAttribute;
        getAttribute(name: "createdon"): Attributes.DateAttribute;
        getAttribute(name: "createdonbehalfby"): Attributes.LookupAttribute;
        getAttribute(name: "createdonbehalfbyname"): Attributes.StringAttribute;
        getAttribute(name: "createdonbehalfbyyominame"): Attributes.StringAttribute;
        getAttribute(name: "importsequencenumber"): Attributes.NumberAttribute;
        getAttribute(name: "kk_approvalstate"): Attributes.OptionSetAttribute;
        getAttribute(name: "kk_iscustombutton"): Attributes.BooleanAttribute;
        getAttribute(name: "kk_request"): Attributes.StringAttribute;
        getAttribute(name: "kk_table1id"): Attributes.StringAttribute;
        getAttribute(name: "modifiedby"): Attributes.LookupAttribute;
        getAttribute(name: "modifiedbyname"): Attributes.StringAttribute;
        getAttribute(name: "modifiedbyyominame"): Attributes.StringAttribute;
        getAttribute(name: "modifiedon"): Attributes.DateAttribute;
        getAttribute(name: "modifiedonbehalfby"): Attributes.LookupAttribute;
        getAttribute(name: "modifiedonbehalfbyname"): Attributes.StringAttribute;
        getAttribute(name: "modifiedonbehalfbyyominame"): Attributes.StringAttribute;
        getAttribute(name: "overriddencreatedon"): Attributes.DateAttribute;
        getAttribute(name: "ownerid"): Attributes.LookupAttribute;
        getAttribute(name: "owneridname"): Attributes.StringAttribute;
        getAttribute(name: "owneridtype"): Attributes.Attribute;
        getAttribute(name: "owneridyominame"): Attributes.StringAttribute;
        getAttribute(name: "owningbusinessunit"): Attributes.LookupAttribute;
        getAttribute(name: "owningbusinessunitname"): Attributes.StringAttribute;
        getAttribute(name: "owningteam"): Attributes.LookupAttribute;
        getAttribute(name: "owninguser"): Attributes.LookupAttribute;
        getAttribute(name: "statecode"): Attributes.OptionSetAttribute;
        getAttribute(name: "statuscode"): Attributes.OptionSetAttribute;
        getAttribute(name: "timezoneruleversionnumber"): Attributes.NumberAttribute;
        getAttribute(name: "utcconversiontimezonecode"): Attributes.NumberAttribute;
        getAttribute(name: "versionnumber"): Attributes.NumberAttribute;
        getControl(name: "createdby"): Controls.LookupControl;
        getControl(name: "createdbyname"): Controls.StringControl;
        getControl(name: "createdbyyominame"): Controls.StringControl;
        getControl(name: "createdon"): Controls.DateControl;
        getControl(name: "createdonbehalfby"): Controls.LookupControl;
        getControl(name: "createdonbehalfbyname"): Controls.StringControl;
        getControl(name: "createdonbehalfbyyominame"): Controls.StringControl;
        getControl(name: "importsequencenumber"): Controls.NumberControl;
        getControl(name: "kk_approvalstate"): Controls.OptionSetControl;
        getControl(name: "kk_iscustombutton"): Controls.StandardControl;
        getControl(name: "kk_request"): Controls.StringControl;
        getControl(name: "kk_table1id"): Controls.StringControl;
        getControl(name: "modifiedby"): Controls.LookupControl;
        getControl(name: "modifiedbyname"): Controls.StringControl;
        getControl(name: "modifiedbyyominame"): Controls.StringControl;
        getControl(name: "modifiedon"): Controls.DateControl;
        getControl(name: "modifiedonbehalfby"): Controls.LookupControl;
        getControl(name: "modifiedonbehalfbyname"): Controls.StringControl;
        getControl(name: "modifiedonbehalfbyyominame"): Controls.StringControl;
        getControl(name: "overriddencreatedon"): Controls.DateControl;
        getControl(name: "ownerid"): Controls.LookupControl;
        getControl(name: "owneridname"): Controls.StringControl;
        getControl(name: "owneridtype"): Controls.Control;
        getControl(name: "owneridyominame"): Controls.StringControl;
        getControl(name: "owningbusinessunit"): Controls.LookupControl;
        getControl(name: "owningbusinessunitname"): Controls.StringControl;
        getControl(name: "owningteam"): Controls.LookupControl;
        getControl(name: "owninguser"): Controls.LookupControl;
        getControl(name: "statecode"): Controls.OptionSetControl;
        getControl(name: "statuscode"): Controls.OptionSetControl;
        getControl(name: "timezoneruleversionnumber"): Controls.NumberControl;
        getControl(name: "utcconversiontimezonecode"): Controls.NumberControl;
        getControl(name: "versionnumber"): Controls.NumberControl;
    }

}

