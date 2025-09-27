export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: '13.0.4'
    }
    graphql_public: {
        Tables: {
            [_ in never]: never
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            graphql: {
                Args: {
                    extensions?: Json
                    operationName?: string
                    query?: string
                    variables?: Json
                }
                Returns: Json
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
    public: {
        Tables: {
            case_items: {
                Row: {
                    case_id: string
                    chance: number
                    id: number
                    image_url: string
                    is_souvenir: boolean
                    is_stattrak: boolean
                    item_name: string
                    item_type: string
                    item_wear: string
                    price: number
                }
                Insert: {
                    case_id: string
                    chance: number
                    id: number
                    image_url: string
                    is_souvenir: boolean
                    is_stattrak: boolean
                    item_name: string
                    item_type: string
                    item_wear: string
                    price: number
                }
                Update: {
                    case_id?: string
                    chance?: number
                    id?: number
                    image_url?: string
                    is_souvenir?: boolean
                    is_stattrak?: boolean
                    item_name?: string
                    item_type?: string
                    item_wear?: string
                    price?: number
                }
                Relationships: [
                    {
                        foreignKeyName: 'case_details_case_id_fkey'
                        columns: ['case_id']
                        isOneToOne: false
                        referencedRelation: 'cases'
                        referencedColumns: ['id']
                    },
                ]
            }
            cases: {
                Row: {
                    id: string
                    imageUrl: string
                    price: number
                    slug: string
                    title: string
                }
                Insert: {
                    id: string
                    imageUrl: string
                    price?: number
                    slug: string
                    title: string
                }
                Update: {
                    id?: string
                    imageUrl?: string
                    price?: number
                    slug?: string
                    title?: string
                }
                Relationships: []
            }
            retro_comments: {
                Row: {
                    column_id: string
                    comment: string
                    created_at: string
                    id: string
                    retro_id: string | null
                    user_id: string
                }
                Insert: {
                    column_id: string
                    comment?: string
                    created_at?: string
                    id?: string
                    retro_id?: string | null
                    user_id: string
                }
                Update: {
                    column_id?: string
                    comment?: string
                    created_at?: string
                    id?: string
                    retro_id?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'retro_comments_retro_id_fkey'
                        columns: ['retro_id']
                        isOneToOne: false
                        referencedRelation: 'retros'
                        referencedColumns: ['id']
                    },
                ]
            }
            retro_templates: {
                Row: {
                    background_color: string | null
                    category_id: string | null
                    cover_url: string | null
                    created_at: string
                    description: string | null
                    id: string
                    template_columns: Json
                    title: string
                }
                Insert: {
                    background_color?: string | null
                    category_id?: string | null
                    cover_url?: string | null
                    created_at?: string
                    description?: string | null
                    id?: string
                    template_columns: Json
                    title: string
                }
                Update: {
                    background_color?: string | null
                    category_id?: string | null
                    cover_url?: string | null
                    created_at?: string
                    description?: string | null
                    id?: string
                    template_columns?: Json
                    title?: string
                }
                Relationships: []
            }
            retros: {
                Row: {
                    created_at: string
                    id: string
                    name: string
                    team_id: string
                    template_id: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    name?: string
                    team_id: string
                    template_id: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    name?: string
                    team_id?: string
                    template_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'retros_team_id_fkey'
                        columns: ['team_id']
                        isOneToOne: false
                        referencedRelation: 'teams'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'retros_template_id_fkey'
                        columns: ['template_id']
                        isOneToOne: false
                        referencedRelation: 'retro_templates'
                        referencedColumns: ['id']
                    },
                ]
            }
            teams: {
                Row: {
                    created_at: string
                    id: string
                    invite_token: string | null
                    name: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    invite_token?: string | null
                    name: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    invite_token?: string | null
                    name?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
    DefaultSchemaTableNameOrOptions extends
        | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
        ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
              DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
          DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
          Row: infer R
      }
        ? R
        : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
            DefaultSchema['Views'])
      ? (DefaultSchema['Tables'] &
            DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R
        }
          ? R
          : never
      : never

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema['Tables']
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Insert: infer I
      }
        ? I
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
      ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
            Insert: infer I
        }
          ? I
          : never
      : never

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema['Tables']
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Update: infer U
      }
        ? U
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
      ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
            Update: infer U
        }
          ? U
          : never
      : never

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
        | keyof DefaultSchema['Enums']
        | { schema: keyof DatabaseWithoutInternals },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
        : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
      ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
      : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
        | keyof DefaultSchema['CompositeTypes']
        | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
        ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
        : never = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
      ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
      : never

export const Constants = {
    graphql_public: {
        Enums: {},
    },
    public: {
        Enums: {},
    },
} as const
