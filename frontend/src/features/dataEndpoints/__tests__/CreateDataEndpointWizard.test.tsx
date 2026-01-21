import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateDataEndpointWizard } from '../CreateDataEndpointWizard';
import { connectorService } from '../../../services';
import { BrowserRouter } from 'react-router-dom';

// Mock services
vi.mock('../../../services', () => ({
    connectorService: {
        getAll: vi.fn(),
        getTables: vi.fn(),
    },
    dataEndpointService: {
        create: vi.fn(),
    },
}));

// Mock child components to simplify testing
vi.mock('../components/Step1SelectConnector', () => ({
    Step1SelectConnector: () => <div data-testid="step1">Step 1</div>
}));
vi.mock('../components/Step2DefineSource', () => ({
    Step2DefineSource: () => <div data-testid="step2">Step 2</div>
}));
vi.mock('../components/Step3BuildQuery', () => ({
    Step3BuildQuery: () => <div data-testid="step3">Step 3</div>
}));
vi.mock('../components/Step4Preview', () => ({
    Step4Preview: () => <div data-testid="step4">Step 4</div>
}));
vi.mock('../components/Step4Finalize', () => ({
    Step4Finalize: () => <div data-testid="step5">Step 5</div>
}));

// Mock useSearchParams
const mockSetSearchParams = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useSearchParams: () => [mockSearchParams, mockSetSearchParams],
    };
});

describe('CreateDataEndpointWizard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSearchParams = new URLSearchParams();
        (connectorService.getAll as any).mockResolvedValue({ data: [] });
        (connectorService.getTables as any).mockResolvedValue({ data: [] });
    });

    it('starts at Step 1 when no connector is pre-selected', async () => {
        render(
            <BrowserRouter>
                <CreateDataEndpointWizard />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId('step1')).toBeInTheDocument();
        });
        expect(connectorService.getAll).toHaveBeenCalled();
    });

    it('starts at Step 2 and loads tables when connector is pre-selected', async () => {
        const connectorId = 'test-connector-id';
        mockSearchParams.set('connectorId', connectorId);

        // Mock connectors response to include the pre-selected one
        (connectorService.getAll as any).mockResolvedValue({
            data: [{ id: connectorId, name: 'Test Connector' }]
        });

        render(
            <BrowserRouter>
                <CreateDataEndpointWizard />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId('step2')).toBeInTheDocument();
        });

        // Verify that getTables was called with the pre-selected connector ID
        expect(connectorService.getTables).toHaveBeenCalledWith(connectorId);
    });
});
