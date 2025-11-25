import { HeaderPo } from '@/cypress/e2e/po/components/header.po';
import HomePagePo from '@/cypress/e2e/po/pages/home.po';
import ClusterDashboardPagePo from '@/cypress/e2e/po/pages/explorer/cluster-dashboard.po';
import ClusterManagerListPagePo from '@/cypress/e2e/po/pages/cluster-manager/cluster-manager-list.po';
import { FleetDashboardListPagePo } from '@/cypress/e2e/po/pages/fleet/fleet-dashboard.po';
import UsersPo from '@/cypress/e2e/po/pages/users-and-auth/users.po';
import ExtensionsPagePo from '@/cypress/e2e/po/pages/extensions.po';
import { SettingsPagePo } from '@/cypress/e2e/po/pages/global-settings/settings.po';

import ChatPo from '@/cypress/e2e/po/extensions/ai/chat.po';

describe('Chat', () => {
  const header = new HeaderPo();
  const chat = new ChatPo();

  beforeEach(() => {
    cy.login();
  });

  describe('Open Chat from different UI areas', () => {
    it('Home', () => {
      HomePagePo.goTo();

      header.askLizButton().click();
      chat.checkExists();
    });

    it('Cluster dashboard', () => {
      const localClusterDashboard = new ClusterDashboardPagePo('local');

      localClusterDashboard.goTo();

      header.askLizButton().click();
      chat.checkExists();
    });

    it('Cluster management', () => {
      const clusterList = new ClusterManagerListPagePo();

      clusterList.goTo();
      clusterList.waitForPage();

      header.askLizButton().click();
      chat.checkExists();
    });

    it('Fleet', () => {
      const fleetDashboardPage = new FleetDashboardListPagePo('_');

      fleetDashboardPage.goTo();
      fleetDashboardPage.waitForPage();

      header.askLizButton().click();
      chat.checkExists();
    });

    it('Users', () => {
      const usersPo = new UsersPo();

      usersPo.goTo();
      usersPo.waitForPage();

      header.askLizButton().click();
      chat.checkExists();
    });

    it('Extensions', () => {
      const extensionsPo = new ExtensionsPagePo();

      extensionsPo.goTo();
      extensionsPo.waitForPage();

      header.askLizButton().click();
      chat.checkExists();
    });

    it('Settings', () => {
      const settingsPage = new SettingsPagePo('_');

      settingsPage.goTo();
      settingsPage.waitForPage();

      header.askLizButton().click();
      chat.checkExists();
    });
  });

  describe('Welcome Message', () => {
    it('Show welcome message template and suggestions', () => {
      cy.login();

      HomePagePo.goTo();

      cy.enqueueAIAgentResponse({
        content:   'Providing mock response from the agent, containing suggestions for the welcome message. <suggestion>View resources</suggestion><suggestion>Analyze logs</suggestion><suggestion>Do action</suggestion>',
        chunkSize: 30
      });

      header.askLizButton().click();
      chat.checkExists();

      const welcomeMessage = chat.getTemplateMessage('welcome');

      welcomeMessage.should('exist');
      welcomeMessage.within(() => {
        cy.contains("I'm Liz, your personal AI assistant. How can I help you?").should('be.visible');

        const suggestions = ['View resources', 'Analyze logs', 'Do action'];

        suggestions.forEach((s) => {
          cy.contains(s, { timeout: 5000 }).should('be.visible');
        });
      });
    });
  });
});
