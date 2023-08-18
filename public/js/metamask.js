const metamask_btn = document.querySelector("body > section > form > button");
metamask_btn.addEventListener("click", (e) => {
  e.preventDefault();
  getAccount();
});
async function getAccount() {
  let activeAccount;
  if (window.ethereum) {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    if (accounts.length == 0) {
      console.log("Please connect to MetaMask");
    } else if (accounts[0] !== activeAccount) {
      activeAccount = accounts[0];
    }
    const div_element = document.querySelector(".hide");
    div_element.classList.remove("hide");
    div_element.querySelector("input").value = activeAccount;
  } else {
    console.log("Error");
  }
}
