import { describe, it, expect } from "@jest/globals";
import {
  FunctionCall,
  makeDoubleExternalQuotes,
  parseFunctionCall,
  parseOutput,
} from "../src/lib/parser";

describe("Parse output", () => {
  it("should not error", () => {
    const output = parseOutput(
      "Reasoning: We have successfully retrieved the recent information about Mr. Daniel Solís Martínez's case. The most recent event is an insurance note related to water damage from a plumbing issue. The claim has not yet been completed and the case has been passed on to WekLaw.\n" +
        "\n" +
        "Plan:\n" +
        "- Inform the user about the retrieved information.\n" +
        "\n" +
        "Commands:\n",
    );
    expect(output).toBeDefined();
    expect(output.reasoning).toBe(
      "We have successfully retrieved the recent information about Mr. Daniel Solís Martínez's case. The most recent event is an insurance note related to water damage from a plumbing issue. The claim has not yet been completed and the case has been passed on to WekLaw.",
    );
    expect(output.plan).toBe(
      "- Inform the user about the retrieved information.",
    );
    expect(output.tellUser).toBe("");
    expect(output.commands).toStrictEqual([]);
    expect(output.completed).toBe(true);
  });
  it("should not error including tell user", () => {
    const output = parseOutput(
      "Reasoning:\n" +
        "The user's request is vague and needs clarification. We need to understand what kind of trap they are referring to, for which customer this is for, and what the context of the scheduling is about.\n" +
        "\n" +
        "Plan:\n" +
        "- Ask the user for more information about the type of trap, the customer involved, and any other relevant details.\n" +
        "\n" +
        "Tell user:\n" +
        "Could you please provide more information? Who is the customer we need to schedule a trap for and what type of trap are we talking about?\n",
    );
    expect(output).toBeDefined();
    expect(output.reasoning).toBe(
      "The user's request is vague and needs clarification. We need to understand what kind of trap they are referring to, for which customer this is for, and what the context of the scheduling is about.",
    );
    expect(output.plan).toBe(
      "- Ask the user for more information about the type of trap, the customer involved, and any other relevant details.",
    );
    expect(output.tellUser).toBe(
      "Could you please provide more information? Who is the customer we need to schedule a trap for and what type of trap are we talking about?",
    );
    expect(output.commands).toStrictEqual([]);
    expect(output.completed).toBe(true);
  });
  it("should not error no plan, no commands", () => {
    const output = parseOutput(
      "Reasoning: We have successfully retrieved the recent information about Mr. Nestor Alfaras's case.\n" +
        "\n" +
        "Tell user: The most recent update for Mr. Nestor Alfaras's case is an insurance note which has been completed. The subproject type was Plumbing and the details were passed on to WekLaw.\n",
    );
    expect(output).toBeDefined();
    expect(output.reasoning).toBe(
      "We have successfully retrieved the recent information about Mr. Nestor Alfaras's case.",
    );
    expect(output.plan).toBe("");
    expect(output.tellUser).toBe(
      "The most recent update for Mr. Nestor Alfaras's case is an insurance note which has been completed. The subproject type was Plumbing and the details were passed on to WekLaw.",
    );
    expect(output.commands).toStrictEqual([]);
    expect(output.completed).toBe(true);
  });
  it("should not error no plan, no commands", () => {
    const output = parseOutput(
      'Reasoning: The search results show multiple individuals with the last name "Martinez". I need to clarify which Mr. Martinez the user is referring to.\n' +
        "\n" +
        "Plan:\n" +
        "- Ask the user to provide more information about Mr. Martinez so we can identify the correct person.\n" +
        "\n" +
        "Tell user: We have multiple customers with the last name Martinez. Could you please provide more information, such as a first name, to help identify the correct Mr. Martinez?",
    );
    expect(output).toBeDefined();
    expect(output.reasoning).toBe(
      'The search results show multiple individuals with the last name "Martinez". I need to clarify which Mr. Martinez the user is referring to.',
    );
    expect(output.plan).toBe(
      "- Ask the user to provide more information about Mr. Martinez so we can identify the correct person.",
    );
    expect(output.tellUser).toBe(
      "We have multiple customers with the last name Martinez. Could you please provide more information, such as a first name, to help identify the correct Mr. Martinez?",
    );
    expect(output.commands).toStrictEqual([]);
    expect(output.completed).toBe(true);
  });
  it("should not output 'invalid input format:'", () => {
    const output = parseOutput(
      "Reasoning: The search results show multiple individuals with",
    );
    expect(output).toBeDefined();
    expect(output.reasoning).toBe(
      "The search results show multiple individuals with",
    );
    expect(output.plan).toBe("");
    expect(output.tellUser).toBe("");
    expect(output.commands).toStrictEqual([]);
    expect(output.completed).toBe(true);
  });

  it("tell user as command", () => {
    const output = parseOutput("Commands:\nTell user: i did a nice command");
    expect(output).toBeDefined();
    expect(output.reasoning).toBe("");
    expect(output.plan).toBe("");
    expect(output.tellUser).toBe("i did a nice command");
    expect(output.commands).toStrictEqual([]);
    expect(output.completed).toBe(true);
  });

  it("long output, parsing commands properly", () => {
    const gptOut =
      "Reasoning:\n" +
      "In order to generate a report showing the most active users in the last 30 days from the construction industry, we will need to create a segment for this specific group of users. Then, we will add necessary columns to this segment. After that, we can generate a report from this segment.\n" +
      "\n" +
      "Plan:\n" +
      "- Create a segment for users in the construction industry.\n" +
      "- Filter this segment to include only users who have been active in the last 30 days.\n" +
      "- Add necessary columns to this new segment (like user activity and user industry).\n" +
      "- Finally, create a report for this segment.\n" +
      "\n" +
      "Tell user:\n" +
      "I'm going to create a report that shows the most active users in the last 30 days from the construction industry. I'll start by creating and setting up a new segment for these users.\n" +
      "\n" +
      "Commands:\n" +
      'create_segment(name="Active Construction Users", segmentType="user")\n' +
      'create_report(reportName="Active Construction Users Report", description="Report showing most active construction industry users in last 30 days.", segmentId="{{id}}", timeframeDays=30, columns=[{"name": "User Activity","type": "number"},{"name": "User Industry","type": "string"}])';
    const output = parseOutput(gptOut);
    expect(output).toStrictEqual({
      reasoning:
        "In order to generate a report showing the most active users in the last 30 days from the construction industry, we will need to create a segment for this specific group of users. Then, we will add necessary columns to this segment. After that, we can generate a report from this segment.",
      plan:
        "- Create a segment for users in the construction industry.\n" +
        "- Filter this segment to include only users who have been active in the last 30 days.\n" +
        "- Add necessary columns to this new segment (like user activity and user industry).\n" +
        "- Finally, create a report for this segment.",
      tellUser:
        "I'm going to create a report that shows the most active users in the last 30 days from the construction industry. I'll start by creating and setting up a new segment for these users.",
      commands: [
        {
          name: "create_segment",
          args: {
            name: "Active Construction Users",
            segmentType: "user",
          },
        },
        {
          name: "create_report",
          args: {
            reportName: "Active Construction Users Report",
            description:
              "Report showing most active construction industry users in last 30 days.",
            segmentId: "{{id}}",
            timeframeDays: 30,
            columns: [
              {
                name: "User Activity",
                type: "number",
              },
              {
                name: "User Industry",
                type: "string",
              },
            ],
          },
        },
      ],
      completed: false,
    });
  });
  it("incorrectly-ordered real world output", () => {
    const gptOut =
      "Reasoning: To create a new account for the client, I will use the 'create_account' function. The required parameters are 'workflow' and 'data'. Under 'workflow', I will set the code to 'client.sub-account' as we are creating a sub-account for an existing client. Under 'data', I will provide the clientId (which in this case is 23030138) and a currency code as per ISO 4217.\n" +
      "\n" +
      "Tell user: Please provide the currency for the new account.\n" +
      "\n" +
      "Plan:\n" +
      '- Use create_account function with workflow code "client.sub-account" and data containing clientId and currency.';
    const output = parseOutput(gptOut);
    expect(output).toStrictEqual({
      reasoning:
        "To create a new account for the client, I will use the 'create_account' function. The required parameters are 'workflow' and 'data'. Under 'workflow', I will set the code to 'client.sub-account' as we are creating a sub-account for an existing client. Under 'data', I will provide the clientId (which in this case is 23030138) and a currency code as per ISO 4217.",
      plan: '- Use create_account function with workflow code "client.sub-account" and data containing clientId and currency.',
      tellUser: "Please provide the currency for the new account.",
      commands: [],
      completed: true,
    });
  });
  it("incomplete commands should not be tell user. Function ends in fullstop", () => {
    const output = parseOutput(
      "Reasoning: Some reasoning\n" +
        "\n" +
        "Plan:\n" +
        "- Inform the user about the retrieved information.\n" +
        "\n" +
        "Commands: function_call(arg1=1, arg2=2.",
    );
    expect(output).toBeDefined();
    expect(output.reasoning).toBe("Some reasoning");
    expect(output.plan).toBe(
      "- Inform the user about the retrieved information.",
    );
    expect(output.tellUser).toBe("");
    expect(output.commands).toStrictEqual([]);
    expect(output.completed).toBe(true);
  });
  it("incomplete commands should not be tell user. Function has no brackets yet", () => {
    const output = parseOutput(
      "Reasoning: Some reasoning\n" +
        "\n" +
        "Plan:\n" +
        "- Inform the user about the retrieved information.\n" +
        "\n" +
        "Commands: function_ca",
    );
    expect(output).toBeDefined();
    expect(output.reasoning).toBe("Some reasoning");
    expect(output.plan).toBe(
      "- Inform the user about the retrieved information.",
    );
    expect(output.tellUser).toBe("");
    expect(output.commands).toStrictEqual([
      {
        name: "function_ca",
        args: {},
      },
    ]);
    expect(output.completed).toBe(false);
  });
  it("tell user mistakenly put under commands", () => {
    const output = parseOutput(
      "Reasoning: Some reasoning\n" +
        "\n" +
        "Plan:\n" +
        "- Inform the user about the retrieved information.\n" +
        "\n" +
        "Commands: I have completed my job.",
    );
    expect(output).toBeDefined();
    expect(output.reasoning).toBe("Some reasoning");
    expect(output.plan).toBe(
      "- Inform the user about the retrieved information.",
    );
    expect(output.tellUser).toBe("I have completed my job.");
    expect(output.commands).toStrictEqual([]);
    expect(output.completed).toBe(true);
  });
  it("tell user mistakenly put under commands but tell user already exists", () => {
    const output = parseOutput(
      "Reasoning: Some reasoning\n" +
        "\n" +
        "Tell user: There's something i'd like to tell you\n" +
        "\n" +
        "Plan:\n" +
        "- Inform the user about the retrieved information.\n" +
        "\n" +
        "Commands: I have completed my job.",
    );
    expect(output).toBeDefined();
    expect(output.reasoning).toBe("Some reasoning");
    expect(output.plan).toBe(
      "- Inform the user about the retrieved information.",
    );
    expect(output.tellUser).toBe("There's something i'd like to tell you");
    expect(output.commands).toStrictEqual([]);
    expect(output.completed).toBe(true);
  });
  it("incomplete commands aren't put into tell user", () => {
    const output = parseOutput(
      "Reasoning: Some reasoning\n" +
        "\n" +
        "Tell user: There's something i'd like to tell you\n" +
        "\n" +
        "Plan:\n" +
        "- Inform the user about the retrieved information.\n" +
        "\n" +
        "Commands: function_call(a=1, ",
    );
    expect(output).toBeDefined();
    expect(output.reasoning).toBe("Some reasoning");
    expect(output.plan).toBe(
      "- Inform the user about the retrieved information.",
    );
    expect(output.tellUser).toBe("There's something i'd like to tell you");
    expect(output.commands).toStrictEqual([]);
    expect(output.completed).toBe(true);
  });
  it("Commands: None should be skipped", () => {
    const output = parseOutput(
      "Reasoning: Some reasoning\n" +
        "\n" +
        "Tell user: There's something i'd like to tell you\n" +
        "\n" +
        "Plan:\n" +
        "- Inform the user about the retrieved information.\n" +
        "\n" +
        "Commands:\n" +
        "None",
    );
    expect(output).toBeDefined();
    expect(output.reasoning).toBe("Some reasoning");
    expect(output.plan).toBe(
      "- Inform the user about the retrieved information.",
    );
    expect(output.tellUser).toBe("There's something i'd like to tell you");
    expect(output.commands).toStrictEqual([]);
    expect(output.completed).toBe(true);
  });
  it("When writing 'Reasoning:', it shouldn't count as Tell user", () => {
    const output = parseOutput("Reason");
    expect(output).toBeDefined();
    expect(output.reasoning).toBe("");
    expect(output.plan).toBe("");
    expect(output.tellUser).toBe("");
    expect(output.commands).toStrictEqual([]);
    expect(output.completed).toBe(true);
  });
  it("Bug found when required args with no choice are filled in", () => {
    const output = parseOutput(
      "Reasoning: \nTo break down the listings by the number of guests allowed, we need to fetch all the listings and then perform data analysis on them to count the number of listings that allow a certain number of guests.\n\nPlan:\n- Fetch all listings using get_listings function.\n- Perform data analysis using perform_data_analysis function to count the number of listings for each guest capacity.\n\nCommands:\nget_listings(limit=\"\", start=\"\")\nperform_data_analysis(instruction='Count the number of listings for each guest capacity', type='bar')",
    );
    expect(output).toBeDefined();
    expect(output.reasoning).toBe(
      "To break down the listings by the number of guests allowed, we need to fetch all the listings and then perform data analysis on them to count the number of listings that allow a certain number of guests.",
    );
    expect(output.plan).toBe(
      "- Fetch all listings using get_listings function.\n- Perform data analysis using perform_data_analysis function to count the number of listings for each guest capacity.",
    );
    expect(output.tellUser).toBe("");
    expect(output.commands).toStrictEqual([
      { name: "get_listings", args: { limit: "", start: "" } },
      {
        name: "perform_data_analysis",
        args: {
          instruction: "Count the number of listings for each guest capacity",
          type: "bar",
        },
      },
    ]);
    expect(output.completed).toBe(false);
  });
  it("Real world", () => {
    const text = `I've found a variety of healthy vegetarian recipes for different meals of the day. Here's a suggested meal plan:

### Breakfast
- **Avocado Toast with Tomato and Poached Egg**: A simple yet nutritious start to the day, featuring ripe avocados, fresh tomatoes, and eggs on whole-grain bread.
- **Green Smoothie Bowl**: Blend spinach, banana, almond milk, and chia seeds for a refreshing and filling breakfast bowl.

### Lunch
- **Quinoa Salad with Mixed Vegetables**: A hearty salad with quinoa, cucumbers, tomatoes, bell peppers, and a lemon vinaigrette.
- **Lentil Soup**: Rich in protein and fiber, this soup is both satisfying and healthy.

### Dinner
- **Portobello and Poblano Enchiladas**: Stuffed flour tortillas with thinly-sliced portobellos and poblanos topped with cheddar and queso fresco. [Epicurious](URL11)
- **Butternut Squash Risotto**: Creamy risotto with roasted butternut squash makes for a comforting dinner. [The Mediterranean Dish](URL12)

### Snacks
- **Famous Tomato Dip**: A quick blend of canned tomatoes, almonds, garlic, and olive oil. [A Couple Cooks](URL16)
- **Crispy Roasted Chickpeas**: Spiced chickpeas roasted until crunchy. [MOON and spoon and yum](URL20)

This meal plan provides a balance of nutrients across different meals while keeping the dishes varied and interesting.

Sources:
[Epicurious](URL11)
[The Mediterranean Dish](URL12)
[A Couple Cooks](URL16)
[MOON and spoon and yum](URL20)`;
    const out = parseOutput(text);
    expect(out).toEqual({
      plan: "",
      reasoning: "",
      commands: [],
      tellUser: text,
      completed: true,
    });
  });
  it("Real world with bad commands text", () => {
    const text = `I've found a variety of healthy vegetarian recipes for different meals of the day. Here's a suggested meal plan:

### Breakfast
- **Avocado Toast with Tomato and Poached Egg**: A simple yet nutritious start to the day, featuring ripe avocados, fresh tomatoes, and eggs on whole-grain bread.
- **Green Smoothie Bowl**: Blend spinach, banana, almond milk, and chia seeds for a refreshing and filling breakfast bowl.

### Lunch
- **Quinoa Salad with Mixed Vegetables**: A hearty salad with quinoa, cucumbers, tomatoes, bell peppers, and a lemon vinaigrette.
- **Lentil Soup**: Rich in protein and fiber, this soup is both satisfying and healthy.

### Dinner
- **Portobello and Poblano Enchiladas**: Stuffed flour tortillas with thinly-sliced portobellos and poblanos topped with cheddar and queso fresco. [Epicurious](URL11)
- **Butternut Squash Risotto**: Creamy risotto with roasted butternut squash makes for a comforting dinner. [The Mediterranean Dish](URL12)

### Snacks
- **Famous Tomato Dip**: A quick blend of canned tomatoes, almonds, garlic, and olive oil. [A Couple Cooks](URL16)
- **Crispy Roasted Chickpeas**: Spiced chickpeas roasted until crunchy. [MOON and spoon and yum](URL20)

This meal plan provides a balance of nutrients across different meals while keeping the dishes varied and interesting.

Sources:
[Epicurious](URL11)
[The Mediterranean Dish](URL12)
[A Couple Cooks](URL16)
[MOON and spoon and yum](URL20)

Commands:
None, I don't need to do anything here`;
    const out = parseOutput(text);
    expect(out).toEqual({
      plan: "",
      reasoning: "",
      commands: [],
      tellUser: text.split("Commands:")[0].trim(),
      completed: true,
    });
  });
  it("Real world with array of objects", () => {
    const text = `
Reasoning:
1. The user wants to create a new active builder with specific parameters.
2. The create_builder function is used to create new builders in the ERP system.
3. The user has provided all necessary parameters for the function.

Commands:
create_builder(DbName="hello", Active=True, ModuleId="123", OwnerType=1, Fields=[{"Name": "bye", "Label": "bye", "Type": 1, "Required": True}], Name="hello")`;
    const out = parseOutput(text);
    expect(out).toEqual({
      plan: "",
      reasoning:
        "1. The user wants to create a new active builder with specific parameters.\n2. The create_builder function is used to create new builders in the ERP system.\n3. The user has provided all necessary parameters for the function.",
      commands: [
        {
          name: "create_builder",
          args: {
            DbName: "hello",
            Active: true,
            ModuleId: "123",
            OwnerType: 1,
            Fields: [{ Name: "bye", Label: "bye", Type: 1, Required: true }],
            Name: "hello",
          },
        },
      ],
      tellUser: "",
      completed: false,
    });
  });
});

describe("parseFunctionCall", () => {
  it("hyphenated argument name", () => {
    const str = `get_account(gtmhub-accountId="64b17ac6548041a751aaf2f6", id_team="64b17ac6548041a751aaf2f7")`;
    const output = parseFunctionCall(str);
    const expectedOutput = {
      name: "get_account",
      args: {
        "gtmhub-accountId": "64b17ac6548041a751aaf2f6",
        id_team: "64b17ac6548041a751aaf2f7",
      },
    };
    expect(output).toStrictEqual(expectedOutput);
  });
  it("argument name with dots in", () => {
    const str = `list_accounts(data.account.availableBalanceFrom="1000")`;
    const output = parseFunctionCall(str);
    const expectedOutput = {
      name: "list_accounts",
      args: {
        "data.account.availableBalanceFrom": "1000",
      },
    };
    expect(output).toStrictEqual(expectedOutput);
  });
  it("argument name with space in skipped", () => {
    const str = `list_accounts(data availableBalanceFrom="1000")`;
    const output = parseFunctionCall(str);
    const expectedOutput = {
      name: "list_accounts",
      args: {
        availableBalanceFrom: "1000",
      },
    };
    expect(output).toStrictEqual(expectedOutput);
  });
  it("object passed to function", () => {
    const str = `create_goal(gtmhub-accountId='64b94e50c1815107739582f9', goal={"title": "Close sales"}, ownerIds=['64b94e50c1815107739582fa'], sessionId='64b94e50c1815107739582fc')`;
    const output = parseFunctionCall(str);
    const expectedOutput = {
      name: "create_goal",
      args: {
        "gtmhub-accountId": "64b94e50c1815107739582f9",
        goal: { title: "Close sales" },
        ownerIds: ["64b94e50c1815107739582fa"],
        sessionId: "64b94e50c1815107739582fc",
      },
    };
    expect(output).toStrictEqual(expectedOutput);
  });

  it("correctly parses function with floating point argument", () => {
    const str = `set_coordinates(x=3.14, y=0.98)`;
    const output = parseFunctionCall(str);
    const expectedOutput = {
      name: "set_coordinates",
      args: { x: 3.14, y: 0.98 },
    };
    expect(output).toEqual(expectedOutput);
  });
  it("correctly parses function mixed argument types", () => {
    const str = `set_coordinates(x=3.14, placeName="The Moon", y=0.98)`;
    const output = parseFunctionCall(str);
    const expectedOutput = {
      name: "set_coordinates",
      args: { x: 3.14, y: 0.98, placeName: "The Moon" },
    };
    expect(output).toEqual(expectedOutput);
  });
  it("string has a comma in it", () => {
    const str = `set_coordinates(x=3.14, placeName="The Moon, the sun", y=0.98)`;
    const output = parseFunctionCall(str);
    const expectedOutput = {
      name: "set_coordinates",
      args: { x: 3.14, y: 0.98, placeName: "The Moon, the sun" },
    };
    expect(output).toEqual(expectedOutput);
  });
  it("string has a comma and single quotes in it", () => {
    const str = `set_coordinates(x=3.14, placeName="The Moon, 'very nice eh', the sun", y=0.98)`;
    const output = parseFunctionCall(str);
    const expectedOutput = {
      name: "set_coordinates",
      args: {
        x: 3.14,
        y: 0.98,
        placeName: "The Moon, 'very nice eh', the sun",
      },
    };
    expect(output).toEqual(expectedOutput);
  });
  it("string has escaped quote in it", () => {
    const str = `set_coordinates(x=3.14, placeName="The Moon,\\" sun ", y=0.98)`;
    const output = parseFunctionCall(str);
    const expectedOutput = {
      name: "set_coordinates",
      args: {
        x: 3.14,
        y: 0.98,
        placeName: 'The Moon," sun ',
      },
    };
    expect(output).toEqual(expectedOutput);
  });
  it("returns function with no arguments when none are provided", () => {
    const str = `do_something()`;
    const output = parseFunctionCall(str);
    const expectedOutput = { name: "do_something", args: {} };
    expect(output).toEqual(expectedOutput);
  });
  it("throws an error when function call format is invalid", () => {
    const str = `getAccount "64b17ac6548041a751aaf2f6" "64b17ac6548041a751aaf2f7"`;
    expect(() => parseFunctionCall(str)).toThrowError(
      "Invalid function call format: " + str,
    );
  });
  it("array of dictionaries", () => {
    const commandText =
      'create_report(reportName="Active Construction Users Report", description="Report showing most active construction industry users in last 30 days.", segmentId="{{id}}", timeframeDays=30, columns=[{"name": "User Activity","type": "number"},{"name": "User Industry","type": "string"}])';
    const output = parseFunctionCall(commandText);
    const expectedOutput = {
      name: "create_report",
      args: {
        reportName: "Active Construction Users Report",
        description:
          "Report showing most active construction industry users in last 30 days.",
        segmentId: "{{id}}",
        timeframeDays: 30,
        columns: [
          {
            name: "User Activity",
            type: "number",
          },
          {
            name: "User Industry",
            type: "string",
          },
        ],
      },
    };
    expect(output).toEqual(expectedOutput);
  });
  it("nested dictionaries", () => {
    const commandText = `create_account(workflow={"code": "client.sub-account"}, data={"account": {"clientId": "09f42c3a-dcea-4468-a77a-40f1e6d456f1", "currency": "USD", "mainAccountId": "74ef55ef-a583-4a96-92f2-b3ad3b5c0682"}})`;
    const output = parseFunctionCall(commandText);
    const expectedOutput = {
      name: "create_account",
      args: {
        workflow: { code: "client.sub-account" },
        data: {
          account: {
            clientId: "09f42c3a-dcea-4468-a77a-40f1e6d456f1",
            currency: "USD",
            mainAccountId: "74ef55ef-a583-4a96-92f2-b3ad3b5c0682",
          },
        },
      },
    };
    expect(output).toEqual(expectedOutput);
  });
  it("parse escaped quotes properly", () => {
    const out = parseFunctionCall(
      `search_filings(query="formType:\\"S-4\\" AND NOT formType:(\\"4/A\\" OR \\"S-4 POS\\")", ticker="AAPL")`,
    );
    expect(out).toStrictEqual({
      name: "search_filings",
      args: {
        query: 'formType:"S-4" AND NOT formType:("4/A" OR "S-4 POS")',
        ticker: "AAPL",
      },
    });
  });
  it("parse escaped quotes properly - single quotes", () => {
    const out = parseFunctionCall(
      `search_filings(query='formType:"S-4" AND NOT formType:("4/A" OR "S-4 POS")', ticker="AAPL")`,
    );
    expect(out).toStrictEqual({
      name: "search_filings",
      args: {
        query: 'formType:"S-4" AND NOT formType:("4/A" OR "S-4 POS")',
        ticker: "AAPL",
      },
    });
  });
  it("parse escaped quotes properly - backslash", () => {
    const out = parseFunctionCall(
      `perform_data_analysis(instruction='Break down Lucas\\' closed deals in the last 6 months by value')`,
    );
    expect(out).toStrictEqual({
      name: "perform_data_analysis",
      args: {
        instruction:
          "Break down Lucas' closed deals in the last 6 months by value",
      },
    });
  });
  it("parse okay when brackets forgotten", () => {
    const out = parseFunctionCall(`list_users`);
    expect(out).toStrictEqual({
      name: "list_users",
      args: {},
    });
  });
  it("replace backslash underscore with underscore in fn name and arg names, but not string values", () => {
    const out = parseFunctionCall(
      `update\\_property(property\\_id="ID\\_1", bedrooms=4)`,
    );
    expect(out).toStrictEqual({
      name: "update_property",
      args: { property_id: "ID\\_1", bedrooms: 4 },
    });
  });
  it("True with capital T, False with capital F", () => {
    const out = parseFunctionCall(
      `update\\_property(expand=True, go_away=False)`,
    );
    expect(out).toStrictEqual({
      name: "update_property",
      args: { expand: true, go_away: false },
    });
  });
  it("Numbered command", () => {
    const out = parseFunctionCall(
      `1. instruct_coder(instruction="Find all deals that were closed in the past 6 months. Then, calculate the total revenue generated by each sales rep from these deals. Finally, identify and return the name of the sales rep with the highest total revenue.")`,
    );
    expect(out).toStrictEqual({
      name: "instruct_coder",
      args: {
        instruction:
          "Find all deals that were closed in the past 6 months. Then, calculate the total revenue generated by each sales rep from these deals. Finally, identify and return the name of the sales rep with the highest total revenue.",
      },
    });
  });
  it("Commas between commands", () => {
    const out = parseFunctionCall(`item_get(id=9),`);
    expect(out).toStrictEqual({
      name: "item_get",
      args: {
        id: 9,
      },
    });
  });
});

describe("makeDoubleExternalQuotes", () => {
  it("single quotes with escaped double quotes", () => {
    const out = makeDoubleExternalQuotes(`'hello \\"world\\"'`);
    expect(out).toBe(`"hello \\"world\\""`);
  });
});
