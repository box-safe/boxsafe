import { createLLM } from "@pack/ai/provider";
import { run } from "@pack/ai/caller";
import { LService, LModel } from "@pack/ai/label";

const loop = (
  service: LService,
  model: LModel,
  prompt: string,

) => {
  const llm = createLLM(service, model);

  while ( true ) {

    run(prompt, llm).catch(
      (err: Error) => {
        console.error("[LLM Runner]", err.message);
        process.exit(1);
      });
  } 

} 


