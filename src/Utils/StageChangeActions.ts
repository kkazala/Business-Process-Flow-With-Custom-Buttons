type AsyncFunction = (formContext: Xrm.FormContext) => Promise<ResultInfo>;

export type ResultInfo={
    success: boolean;
    message?: string;
}
const _FINALIZELASTSTAGE=true;

// The "kk_iscustombutton" field is set to "true" when a custom ribbon button is clicked (FormUtils.UpdateFormOnStageChange)
// It is automatically set to "false" when the move to the next/previous stage is successful, and during rollback (FormUtils.RevertFormOnStageChange)
export default class StageChangeActions {

    private static _moveNextAsync = async (formContext: Xrm.FormContext) : Promise<string> => {
        return new Promise((resolve) => {
            formContext.data.process.moveNext((result) => {
                resolve(result);
            });
        });
    }
    private static _movePreviousAsync = async (formContext: Xrm.FormContext): Promise<string> => {
        return new Promise((resolve) => {
            formContext.data.process.movePrevious((result) => {
                resolve(result);
            });
        });
    }
    private static _saveForm = async (formContext: Xrm.FormContext): Promise<ResultInfo> => {
        try{
            await formContext.data.save();
            return {success:true};
        }
        catch(error:any){
            return {success:false,message:error.message};
        }
    }
    private static _setProcessStatus = async (formContext: Xrm.FormContext, status: Xrm.ProcessFlow.ProcessStatus): Promise<string> => {
        return new Promise((resolve) => {
            formContext.data.process.setStatus(status, (result) => {
                resolve(result);
            });
        });
    }
    private static _processResult = async (formContext: Xrm.FormContext, result: string, onSuccess: AsyncFunction): Promise<ResultInfo> =>{

        switch (result) {
            case "stageGate":
                return {
                    success:false,
                    message: "One or more required columns on the current stage are empty. Cannot proceed."
                };
            case "success":
                return await onSuccess(formContext);
            default:
                //https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/formcontext-data-process/navigation/moveprevious
                //invalid, dirtyForm, crossEntity, preventDefault
                return {
                    success:false,
                    message: `Error: Unable to move to the stage: ${result}`
                };
        }
    }

    public static IsLastStage= (formContext: Xrm.FormContext): boolean => {
        const curStage = formContext.data.process.getActiveStage().getName();
        const path = formContext.data.process.getActivePath().get().map(s => s.getName());
        return curStage === path[path.length - 1];
    }
    public static IsFirstStage= (formContext: Xrm.FormContext): boolean => {
        const curStage = formContext.data.process.getActiveStage().getName();
        const path = formContext.data.process.getActivePath().get().map(s => s.getName());
        return curStage === path[0];
    }
    public static IsNextStageIsLastStage= (formContext: Xrm.FormContext): boolean => {
        const curStage = formContext.data.process.getActiveStage().getName();
        const path = formContext.data.process.getActivePath().get().map(s => s.getName());
        return curStage === path[path.length - 2];
    }


    //async MoveStage method
    public static MoveStageAsync = async function (formContext: Xrm.FormContext, stageDelegate: AsyncFunction): Promise<ResultInfo> {
        let success: boolean = false;
        let message: string = "";

        try{
            //should not happen, but just in case
            if (formContext.data.getIsDirty()) {
                await formContext.data.save();
            }
            //call MoveNext / MovePrevious
            return await stageDelegate(formContext);

        }
        catch (error:any) {
            message=error.message;
        }
        return {success,message};
    }

    public static MoveNextAsync = async (formContext: Xrm.FormContext): Promise<ResultInfo> =>{

        //move to the next stage and complete the process at the same time
        if (_FINALIZELASTSTAGE && StageChangeActions.IsNextStageIsLastStage(formContext)) {
            const result = await StageChangeActions._moveNextAsync(formContext);
            return StageChangeActions._processResult(formContext, result, StageChangeActions.CompleteProcessAsync);
        }
        else if (!_FINALIZELASTSTAGE && StageChangeActions.IsLastStage(formContext) ) {
            if (formContext.data.process.getStatus() === "active"){
                return await StageChangeActions.CompleteProcessAsync(formContext);
            }
            else {
                return{
                    success:false,
                    message: "The process is already finished."
                }
            }
        }
        else {
            const result = await StageChangeActions._moveNextAsync(formContext);
            return StageChangeActions._processResult(formContext, result, StageChangeActions._saveForm);
        }
    }

    public static MovePreviousAsync = async (formContext: Xrm.FormContext): Promise<ResultInfo> => {

        if(StageChangeActions.IsFirstStage(formContext)){
            return {
                success:false,
                message: "The active stage is the first stage of the active path."
            };
        }
        else if (StageChangeActions.IsLastStage(formContext) && formContext.data.process.getStatus() === "finished" ){
            const restartResult = await StageChangeActions.RestartProcessAsync(formContext);

            if (_FINALIZELASTSTAGE && restartResult.success) {
                const result= await StageChangeActions._movePreviousAsync(formContext);
                return StageChangeActions._processResult(formContext, result, StageChangeActions._saveForm);
            }
            else{
                return restartResult;
            }
        }

        else {
            const result= await StageChangeActions._movePreviousAsync(formContext);
            return StageChangeActions._processResult(formContext, result, StageChangeActions._saveForm);
        }
    }

    public static CompleteProcessAsync = async (formContext: Xrm.FormContext): Promise<ResultInfo> => {

        let success: boolean = false;
        let message: string = "";

        if (formContext.data.process.getStatus() === "active") {

            const result = await StageChangeActions._setProcessStatus(formContext, "finished");
            if (result === "finished") {
                return StageChangeActions._saveForm(formContext);
            }
            else {
                return{
                    success:false,
                    message: "Error: Unable to complete the process."
                }
            }
        }
        return {success, message};
    };

    public static RestartProcessAsync = async (formContext: Xrm.FormContext): Promise<ResultInfo> =>{
        let success: boolean = false;
        let message: string = "";

        const result = await StageChangeActions._setProcessStatus(formContext, "active");
        if (result === "active") {
            await formContext.data.save();
            success = true;
        }
        else {
            message = "Error: Unable to restart the process.";
        }

        return {success, message};
    }

}