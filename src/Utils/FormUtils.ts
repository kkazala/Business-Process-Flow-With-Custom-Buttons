export default class FormUtils{
    //#region private methods

    private static setStatus = (formContext: Xrm.FormContext, fStatusCode: string, status: Kk_table1Enum.statuscode) => {
        formContext.getAttribute(fStatusCode).setValue(status);
        formContext.getAttribute(fStatusCode).fireOnChange();
    }
    private static setState = (formContext: Xrm.FormContext,
        fStatusCode: string, status: Kk_table1Enum.statuscode,
        fStateCode: string, state: Kk_table1Enum.statecode
    ) => {
        formContext.getAttribute(fStatusCode).setValue(status);
        formContext.getAttribute(fStatusCode).fireOnChange();

        formContext.getAttribute(fStateCode).setValue(state);
        formContext.getAttribute(fStateCode).fireOnChange();
    }
    //#endregion
    public static SetIsCustomButton = (value: boolean) => {
        // formContext.getAttribute("kk_iscustombutton").setValue(value);
        localStorage.setItem("kk_iscustombutton", value.toString());

    }
    public static GetIsCustomButton = (): boolean => {
        return localStorage.getItem("kk_iscustombutton") === "true" ? true : false;
    }

    public static HideAllNotifications = (formContext: Xrm.FormContext) => {
        formContext.ui.clearFormNotification("versionMismatch");
        formContext.ui.clearFormNotification("save");
        formContext.ui.clearFormNotification("moveStage");
        formContext.ui.clearFormNotification("revert");
        formContext.ui.clearFormNotification("movestagecancelled");
    }

    public static OnStageChangeUpdateAndSaveAsync = async (formContext: Xrm.FormContext, direction: Xrm.ProcessFlow.StageChangeDirection): Promise<boolean> => {

        let success: boolean = false;

        try{

            switch (formContext.data.process.getActiveStage().getName()) {
                case "Request":
                    if (direction === XrmEnum.StageChangeDirection.Next) {
                        //from Draft to InReview
                        FormUtils.setStatus(formContext, "statuscode", Kk_table1Enum.statuscode.Inreview);
                    }
                    break;
                case "Review":
                    if (direction === XrmEnum.StageChangeDirection.Next) {
                        //from InReview to InApproval
                        FormUtils.setStatus(formContext, "statuscode", Kk_table1Enum.statuscode.Inapproval);
                    }
                    else if (direction === XrmEnum.StageChangeDirection.Previous) {
                        //from InReview to Draft
                        FormUtils.setStatus(formContext, "statuscode", Kk_table1Enum.statuscode.Draft);
                    }
                    break;
                case "Approval":
                    if (direction === XrmEnum.StageChangeDirection.Next) {
                        //from InApproval to Approved/Rejected
                        if (formContext.getAttribute("kk_approvalstate").getValue() === Kk_table1Enum.kk_approvalstate.Yes){
                                FormUtils.setState(formContext, "statuscode", Kk_table1Enum.statuscode.Approved, "statecode", Kk_table1Enum.statecode.Inactive);
                        }
                        else{
                            FormUtils.setState(formContext, "statuscode", Kk_table1Enum.statuscode.Rejected, "statecode", Kk_table1Enum.statecode.Inactive);
                        }
                    }
                    else if (direction === XrmEnum.StageChangeDirection.Previous) {
                        if (formContext.data.process.getStatus() === "finished") {
                        //from Approved/Rejected to InApproval
                            FormUtils.setState(formContext, "statuscode", Kk_table1Enum.statuscode.Inapproval, "statecode", Kk_table1Enum.statecode.Active);
                        }
                        else{
                            //from InApproval to InReview
                            FormUtils.setState(formContext, "statuscode", Kk_table1Enum.statuscode.Inreview, "statecode", Kk_table1Enum.statecode.Active);

                        }
                    }
                    break;
            }

            await formContext.data.save();  //returns saved entityReference obj  {entityType:string, id:guid, name:undefined}
            success = true;
        }
        catch (error: any) {
            formContext.ui.setFormNotification(`Error updating form: ${error.message}`, XrmEnum.FormNotificationLevel.Error, "1");
        }

        return success;
    }

    public static OnStageChangeRevertAndSaveAsync = async (formContext: Xrm.FormContext): Promise<boolean> => {
        let success: boolean = false;

        try {
            switch (formContext.data.process.getActiveStage().getName()) {
                case "Request":
                    FormUtils.setStatus(formContext, "statuscode", Kk_table1Enum.statuscode.Draft);
                    break;
                case "Review":
                    FormUtils.setStatus(formContext, "statuscode", Kk_table1Enum.statuscode.Inreview);
                    break;
                case "Approve":
                    FormUtils.setState(formContext, "statuscode", Kk_table1Enum.statuscode.Inapproval, "statecode", Kk_table1Enum.statecode.Active);
                    break;
            }

            await formContext.data.save();  //returns saved entityReference obj  {entityType:string, id:guid, name:undefined}
            success = true;
        }
        catch (error) {
            formContext.ui.setFormNotification("Error updating form", XrmEnum.FormNotificationLevel.Error, "1");
        }

        return success;
    }
}