export function checkEligibility(startup, challenge) {
  const profile = startup.startupProfile || {};
  const registered = profile.isRegisteredEntity === true;
  const challengeDomain = challenge.requirements?.domain?.trim().toLowerCase();
  const startupDomain = profile.domain?.trim().toLowerCase();
  const sectorMatch = Boolean(
    challengeDomain &&
      startupDomain &&
      (startupDomain.includes(challengeDomain) ||
        challengeDomain.includes(startupDomain)),
  );
  const hasWorkingPrototype = ["prototype", "deployed"].includes(
    profile.prototypeStage,
  );
  return {
    registered,
    sectorMatch,
    hasWorkingPrototype,
    eligible: registered && sectorMatch && hasWorkingPrototype,
  };
}
