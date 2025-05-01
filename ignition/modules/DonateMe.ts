// DonateMe deployment module for Hardhat Ignition
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DonateMeModule = buildModule("DonateMeModule", (m) => {
  // get contract
  const donateMe = m.contract("DonateMe", [], {});

  return { donateMe };
});

export default DonateMeModule;
