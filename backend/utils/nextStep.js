function routeForStep(step) {
  switch (step) {
    case "profile":
      return "/worker-profile";
    case "skills":
      return "/worker-skills";
    case "documents":
      return "/worker-document";
    case "done":
      return "/worker-dashboard";
    default:
      return "/worker-dashboard";
  }
}

function nextResponse({ isNew, onboardingStep, kind }) {
  if (kind === "auth") {
    return { route: "/worker-dashboard", step: "dashboard" };
  }
  return {
    route: routeForStep(onboardingStep),
    step: onboardingStep,
    isNewUser: Boolean(isNew),
  };
}

module.exports = { routeForStep, nextResponse };
