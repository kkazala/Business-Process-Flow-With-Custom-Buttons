
type AsyncFunction = (formContext: Xrm.FormContext) => Promise<ResultInfo>;
type StageDelegate = (formContext: Xrm.FormContext, finalizeLastStage:boolean) => Promise<ResultInfo>;

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
            await formContext.data.save();   //returns saved entityReference obj  {entityType:string, id:guid, name:undefined}
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
    public static MoveStageAsync = async function (formContext: Xrm.FormContext, stageDelegate: StageDelegate, finalizeLastStage: boolean): Promise<ResultInfo> {
        let success: boolean = false;
        let message: string = "";

        try{
            //should not happen, but just in case
            if (formContext.data.getIsDirty()) {
                await formContext.data.save();
            }
            //call MoveNext / MovePrevious
            return await stageDelegate(formContext,finalizeLastStage);

        }
        catch (error:any) {
            message=error.message;
        }
        return {success,message};
    }

    public static MoveNextAsync = async (formContext: Xrm.FormContext, finalizeLastStage:boolean): Promise<ResultInfo> =>{

        const moveToLastAndFinalize = finalizeLastStage && StageChangeActions.IsNextStageIsLastStage(formContext);
        const moveToLast = !finalizeLastStage && StageChangeActions.IsLastStage(formContext);

        //move to the next (last) stage and complete the BPF at the same time
        if (moveToLastAndFinalize) {
            const result = await StageChangeActions._moveNextAsync(formContext);
            return StageChangeActions._processResult(formContext, result, StageChangeActions.CompleteProcessAsync);
        }
        //move to the next (last) stage and do NOT complete the BPF
        else if (moveToLast) {
            return await StageChangeActions.CompleteProcessAsync(formContext);
        }
        //move to the next stage
        else {
            const result = await StageChangeActions._moveNextAsync(formContext);
            return StageChangeActions._processResult(formContext, result, StageChangeActions._saveForm);
        }
    }

    public static MovePreviousAsync = async (formContext: Xrm.FormContext, finalizeLastStage:boolean): Promise<ResultInfo> => {

        //first stage, no previous stage
        if(StageChangeActions.IsFirstStage(formContext)){
            return {
                success:false,
                message: "The active stage is the first stage of the active path."
            };
        }
        //last stage and the process is finished
        else if (StageChangeActions.IsLastStage(formContext) && formContext.data.process.getStatus() === "finished" ){
            //restart the process
            const restartResult = await StageChangeActions.RestartProcessAsync(formContext);

            //if stage was finalized automatically, additionally move to the previous stage
            if (finalizeLastStage && restartResult.success) {
                const result= await StageChangeActions._movePreviousAsync(formContext);
                return StageChangeActions._processResult(formContext, result, StageChangeActions._saveForm);
            }
            else{
                return restartResult;
            }
        }
        // either last stage and the BPF is active
        // or "middle" stages
        else {
            const result= await StageChangeActions._movePreviousAsync(formContext);
            return StageChangeActions._processResult(formContext, result, StageChangeActions._saveForm);
        }
    }

    public static CompleteProcessAsync = async (formContext: Xrm.FormContext): Promise<ResultInfo> => {

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
        else {
            return {
                success: false,
                message: "The process is already finished."
            }
        }
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