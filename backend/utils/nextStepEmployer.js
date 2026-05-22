function routeForStep(step) {
  switch (step) {
    case "profile":
      return "/employee-profileform";
    case "done":
      return "/employee-dashboard";
    default:
      return "/employee-dashboard";
  }
}

function nextEmployerResponse({ isNew, onboardingStep, kind }) {
  if (kind === "auth") {
    return { route: "/employee-dashboard", step: "dashboard" };
  }
  return {
    route: routeForStep(onboardingStep),
    step: onboardingStep,
    isNewUser: Boolean(isNew),
  };
}

module.exports = { routeForStep, nextEmployerResponse };

