import axios from "axios";
import env from "./.env.json";

// Define the API endpoint
const API_ENDPOINT = env.OPENAI_ENDPOINT;
// Define the headers for the API request
const headers = {
  "Content-Type": "application/json",
  "Api-Key": env.OPENAI_API_KEY,
};

export function getPrompt(text: string) {
  // Define the prompt and max tokens for the API request
  const prompt = `You are an AI-powered creative assistant and Animation storyboard painter, employing Midjourney to create compelling AI-generated art. You will receive an excerpt from a novel, Your tasks are: 
  1) Read the excerpt carefully and identify 10 key scenes that drive the story forward.
  2) For each scene, generate a comprehensive, multifaceted prompt for Midjourney, ensuring every detail of the original scene is captured in your instructions.
  Now, here is your tasks and results:
  task: an excerpt from a novel
  result: "Midjourneyprompt1":"xxxxx","Midjourneyprompt2":"xxxxx","Midjourneyprompt3":"xxxxx","Midjourneyprompt4":"xxxxx","Midjourneyprompt5":"xxxxx","Midjourneyprompt6":"xxxxx","Midjourneyprompt7":"xxxxx","Midjourneyprompt8":"xxxxx","Midjourneyprompt9":"xxxxx","Midjourneyprompt10":"xxxxx"PROMPTEND
  task: ${text}
  JSONresult:`;
  const maxTokens = 4000;

  // Define the data for the API request
  const data = {
    prompt: prompt,
    max_tokens: maxTokens,
    stop: ["PROMPTEND"],
  };

  // Send a POST request to the OpenAI API
  return axios
    .post(API_ENDPOINT, data, { headers: headers })
    .then((response) => {
      const regex = /"Midjourneyprompt\d+":\s*"([^"]*)"/g;
      let matches;
      const prompts = [];

      while (
        (matches = regex.exec(response.data.choices[0].text.trim())) !== null
        ) {
        prompts.push(matches[1]);
      }

      console.log(prompts); // This will print an array of all values of "Midjourneyprompt"

      return prompts;
    })
    .catch((error) => {
      console.error(error);
    });
}
