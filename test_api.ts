
async function test() {
  const apiKey = "7e8903b0f86e4bff14b6ba1df2d860a724e2adb3e69d8ae3eaaf4dbdfaae6023";
  try {
    const response = await fetch(`https://api.the-odds-api.com/v4/sports/?apiKey=${apiKey}`);
    if (!response.ok) {
      const data = await response.json();
      console.error("API Error:", response.status, data);
      return;
    }
    const data = await response.json() as any[];
    console.log("API Key is valid. Active sports:", data.length);
    const soccerSports = data.filter((s: any) => s.group === 'Soccer');
    console.log("Soccer sports:", soccerSports.map((s: any) => s.key));
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

test();
