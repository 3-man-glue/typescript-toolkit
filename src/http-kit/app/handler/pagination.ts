import { PaginationPipeException } from '@http-kit/exception/pagination'
import { Handler } from '@http-kit/app/handler/handler'
import { ContextDto } from '@http-kit/context/interfaces'
import { PaginationResponse, ParsedPaginationResponse } from '@http-kit/app/handler/interfaces'

export class PaginationPipe extends Handler<ContextDto, PaginationResponse | ParsedPaginationResponse> {
  public handle(): void {
    const response = this.context.response as PaginationResponse
    const filters = response.filters && Object.keys(response.filters).length ? response.filters : null

    if (!(response.page || response.result)) {
      throw new PaginationPipeException().withInput({ response })
    }

    this.context.response = {
      limit: response.page.size,
      total: response.page.total,
      current_page: response.page.current,
      items: response.result,
      filters,
    }
  }
}
