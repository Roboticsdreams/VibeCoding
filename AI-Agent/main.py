import os
import datetime
import json
from dotenv import load_dotenv
from pydantic import BaseModel
from openai import OpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnablePassthrough
from tools import save_to_txt

# Load environment variables
load_dotenv()

# Define Pydantic model for structured output
class ResearchResponse(BaseModel):
    topic: str
    summary: str
    sources: list[str] = []

# --- OpenAI Client Setup for OpenRouter ---
api_key = os.getenv("OPENROUTER_API_KEY")
if not api_key:
    # For development, try to read from .env file
    try:
        with open(".env", "r") as env_file:
            for line in env_file:
                if line.startswith("OPENROUTER_API_KEY="):
                    value = line.strip().split("=", 1)[1]
                    # Remove quotes if present
                    api_key = value.strip('"').strip("'")
                    print(f"Found API key in .env file: {api_key[:5]}...{api_key[-4:]}")
                    break
    except FileNotFoundError:
        print(".env file not found")
        
if not api_key:
    raise ValueError("OPENROUTER_API_KEY environment variable not found.")

# Create the OpenRouter client
client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=api_key
)

# Create LangChain's ChatOpenAI wrapper with the custom client
llm = ChatOpenAI(
    model="openai/gpt-3.5-turbo",  # Use GPT-3.5 with OpenRouter
    temperature=0,
    openai_api_key=api_key,
    openai_api_base="https://openrouter.ai/api/v1"
)

# Create parser for structured output
parser = PydanticOutputParser(pydantic_object=ResearchResponse)

# Define the prompt template
prompt = ChatPromptTemplate.from_template("""
    You are a research assistant that will help generate research summaries.
    
    Please provide a comprehensive response to the user's query: {query}
    
    Your response should include:
    1. A clear topic identification
    2. A detailed summary of the research
    3. Any relevant sources
    
    {format_instructions}
    """)

# Create a chain using runnables
chain = (
    {"query": RunnablePassthrough()}
    | prompt.partial(format_instructions=parser.get_format_instructions())
    | llm
)

# Run the application
if __name__ == "__main__":
    try:
        print("\n==== Research Assistant ====\n")
        query = "what is the capital of France?"
        print("\nResearching your topic...\n")
        
        # Run the chain
        raw_response = chain.invoke({"query": query})
        
        # Try to parse the structured output
        try:
            # Extract content from AIMessage object
            if hasattr(raw_response, 'content'):
                response_text = raw_response.content
            else:
                response_text = str(raw_response)
            
            structured_response = parser.parse(response_text)
            print("\n==== Research Results ====\n")
            print(f"Topic: {structured_response.topic}\n")
            print(f"Summary: {structured_response.summary}\n")
            if structured_response.sources:
                print("Sources:")
                for source in structured_response.sources:
                    print(f"- {source}")
                print()
                
            # Save results to file
            output_text = f"Topic: {structured_response.topic}\n\nSummary: {structured_response.summary}\n"
            if structured_response.sources:
                output_text += "\nSources:\n"
                for source in structured_response.sources:
                    output_text += f"- {source}\n"
            
            save_to_txt(output_text)
            print("\nResearch saved to outputs directory.")
            
        except Exception as e:
            print(f"\nCouldn't parse structured output: {e}")
            print("Raw response:")
            if hasattr(raw_response, 'content'):
                print(raw_response.content)
            else:
                print(raw_response)
            
    except KeyboardInterrupt:
        print("\n\nResearch session ended.")
    except Exception as e:
        print(f"\n\nAn error occurred: {type(e).__name__}: {str(e)}")