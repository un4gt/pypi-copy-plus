export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message) => {
    if (message?.type !== 'BROADCAST_UPDATE_COMMAND') return;
    void broadcastUpdateCommand();
  });
});

async function broadcastUpdateCommand(): Promise<void> {
  const tabs = await browser.tabs.query({ url: '*://pypi.org/project/*' });
  for (const tab of tabs) {
    if (tab.id) {
      browser.tabs.sendMessage(tab.id, { type: 'UPDATE_COMMAND' }).catch(() => {
        // Ignore errors (tab may be closed).
      });
    }
  }
}
