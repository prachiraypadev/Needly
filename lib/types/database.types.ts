export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          phone: string | null;
          phone_verified_at: string | null;
          bio: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          phone?: string | null;
          phone_verified_at?: string | null;
          bio?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          phone?: string | null;
          phone_verified_at?: string | null;
          bio?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      communities: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          type: "apartment" | "gated" | "hostel" | "college" | "university" | "office" | "family" | "other";
          is_private: boolean;
          invite_code: string | null;
          created_by: string;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          type: "apartment" | "gated" | "hostel" | "college" | "university" | "office" | "family" | "other";
          is_private?: boolean;
          invite_code?: string | null;
          created_by: string;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          type?: "apartment" | "gated" | "hostel" | "college" | "university" | "office" | "family" | "other";
          is_private?: boolean;
          invite_code?: string | null;
          created_by?: string;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      community_members: {
        Row: {
          id: string;
          community_id: string;
          user_id: string;
          role: "member" | "moderator" | "admin" | "owner";
          joined_at: string;
          invited_by: string | null;
        };
        Insert: {
          id?: string;
          community_id: string;
          user_id: string;
          role?: "member" | "moderator" | "admin" | "owner";
          joined_at?: string;
          invited_by?: string | null;
        };
        Update: {
          id?: string;
          community_id?: string;
          user_id?: string;
          role?: "member" | "moderator" | "admin" | "owner";
          joined_at?: string;
          invited_by?: string | null;
        };
      };
      community_invites: {
        Row: {
          id: string;
          community_id: string;
          invited_by: string;
          email: string | null;
          phone: string | null;
          token: string;
          expires_at: string;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          community_id: string;
          invited_by: string;
          email?: string | null;
          phone?: string | null;
          token: string;
          expires_at: string;
          accepted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          community_id?: string;
          invited_by?: string;
          email?: string | null;
          phone?: string | null;
          token?: string;
          expires_at?: string;
          accepted_at?: string | null;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          parent_id: string | null;
          icon: string | null;
          sort_order: number;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          parent_id?: string | null;
          icon?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          parent_id?: string | null;
          icon?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
      };
      listings: {
        Row: {
          id: string;
          community_id: string;
          owner_id: string;
          category_id: string | null;
          title: string;
          description: string | null;
          listing_type: "item" | "service";
          transaction_type: "lend" | "rent" | "sell" | "service";
          price_amount: number | null;
          price_unit: "fixed" | "per_day" | "per_hour" | "negotiable" | null;
          quantity: number;
          condition: "new" | "like_new" | "good" | "fair" | "poor" | null;
          status: "draft" | "active" | "paused" | "unavailable" | "archived";
          published_at: string | null;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          community_id: string;
          owner_id: string;
          category_id?: string | null;
          title: string;
          description?: string | null;
          listing_type: "item" | "service";
          transaction_type: "lend" | "rent" | "sell" | "service";
          price_amount?: number | null;
          price_unit?: "fixed" | "per_day" | "per_hour" | "negotiable" | null;
          quantity?: number;
          condition?: "new" | "like_new" | "good" | "fair" | "poor" | null;
          status?: "draft" | "active" | "paused" | "unavailable" | "archived";
          published_at?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          community_id?: string;
          owner_id?: string;
          category_id?: string | null;
          title?: string;
          description?: string | null;
          listing_type?: "item" | "service";
          transaction_type?: "lend" | "rent" | "sell" | "service";
          price_amount?: number | null;
          price_unit?: "fixed" | "per_day" | "per_hour" | "negotiable" | null;
          quantity?: number;
          condition?: "new" | "like_new" | "good" | "fair" | "poor" | null;
          status?: "draft" | "active" | "paused" | "unavailable" | "archived";
          published_at?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      listing_media: {
        Row: {
          id: string;
          listing_id: string;
          storage_path: string;
          url: string;
          mime_type: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          storage_path: string;
          url: string;
          mime_type?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          storage_path?: string;
          url?: string;
          mime_type?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      listing_availability: {
        Row: {
          id: string;
          listing_id: string;
          day_of_week: number;
          time_from: string;
          time_to: string;
          is_available: boolean;
        };
        Insert: {
          id?: string;
          listing_id: string;
          day_of_week: number;
          time_from: string;
          time_to: string;
          is_available?: boolean;
        };
        Update: {
          id?: string;
          listing_id?: string;
          day_of_week?: number;
          time_from?: string;
          time_to?: string;
          is_available?: boolean;
        };
      };
      needs: {
        Row: {
          id: string;
          community_id: string;
          requester_id: string;
          category_id: string | null;
          title: string;
          description: string | null;
          need_type: "borrow" | "rent" | "buy" | "service";
          budget_min: number | null;
          budget_max: number | null;
          quantity: number;
          needed_from: string | null;
          needed_until: string | null;
          status: "open" | "in_progress" | "fulfilled" | "cancelled" | "expired";
          expires_at: string | null;
          fulfillment_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          community_id: string;
          requester_id: string;
          category_id?: string | null;
          title: string;
          description?: string | null;
          need_type: "borrow" | "rent" | "buy" | "service";
          budget_min?: number | null;
          budget_max?: number | null;
          quantity?: number;
          needed_from?: string | null;
          needed_until?: string | null;
          status?: "open" | "in_progress" | "fulfilled" | "cancelled" | "expired";
          expires_at?: string | null;
          fulfillment_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          community_id?: string;
          requester_id?: string;
          category_id?: string | null;
          title?: string;
          description?: string | null;
          need_type?: "borrow" | "rent" | "buy" | "service";
          budget_min?: number | null;
          budget_max?: number | null;
          quantity?: number;
          needed_from?: string | null;
          needed_until?: string | null;
          status?: "open" | "in_progress" | "fulfilled" | "cancelled" | "expired";
          expires_at?: string | null;
          fulfillment_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      need_media: {
        Row: {
          id: string;
          need_id: string;
          storage_path: string;
          url: string;
          mime_type: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          need_id: string;
          storage_path: string;
          url: string;
          mime_type?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          need_id?: string;
          storage_path?: string;
          url?: string;
          mime_type?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      offers: {
        Row: {
          id: string;
          need_id: string;
          listing_id: string | null;
          provider_id: string;
          community_id: string;
          message: string | null;
          price_amount: number | null;
          available_from: string | null;
          available_until: string | null;
          status: "pending" | "accepted" | "rejected" | "withdrawn" | "expired";
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          need_id: string;
          listing_id?: string | null;
          provider_id: string;
          community_id: string;
          message?: string | null;
          price_amount?: number | null;
          available_from?: string | null;
          available_until?: string | null;
          status?: "pending" | "accepted" | "rejected" | "withdrawn" | "expired";
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          need_id?: string;
          listing_id?: string | null;
          provider_id?: string;
          community_id?: string;
          message?: string | null;
          price_amount?: number | null;
          available_from?: string | null;
          available_until?: string | null;
          status?: "pending" | "accepted" | "rejected" | "withdrawn" | "expired";
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          community_id: string;
          need_id: string | null;
          offer_id: string | null;
          listing_id: string | null;
          requester_id: string;
          provider_id: string;
          type: "borrow" | "rent" | "buy" | "service";
          agreed_amount: number | null;
          platform_fee: number;
          currency: string;
          status: "requested" | "accepted" | "confirmed" | "scheduled" | "in_progress" | "completed" | "cancelled" | "disputed";
          scheduled_at: string | null;
          started_at: string | null;
          completed_at: string | null;
          cancelled_at: string | null;
          cancellation_reason: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          community_id: string;
          need_id?: string | null;
          offer_id?: string | null;
          listing_id?: string | null;
          requester_id: string;
          provider_id: string;
          type: "borrow" | "rent" | "buy" | "service";
          agreed_amount?: number | null;
          platform_fee?: number;
          currency?: string;
          status?: "requested" | "accepted" | "confirmed" | "scheduled" | "in_progress" | "completed" | "cancelled" | "disputed";
          scheduled_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          community_id?: string;
          need_id?: string | null;
          offer_id?: string | null;
          listing_id?: string | null;
          requester_id?: string;
          provider_id?: string;
          type?: "borrow" | "rent" | "buy" | "service";
          agreed_amount?: number | null;
          platform_fee?: number;
          currency?: string;
          status?: "requested" | "accepted" | "confirmed" | "scheduled" | "in_progress" | "completed" | "cancelled" | "disputed";
          scheduled_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      rental_details: {
        Row: {
          id: string;
          transaction_id: string;
          pickup_location: string | null;
          return_location: string | null;
          deposit_amount: number | null;
          condition_before: "new" | "like_new" | "good" | "fair" | "poor" | null;
          condition_after: "new" | "like_new" | "good" | "fair" | "poor" | null;
          actual_return_at: string | null;
          late_fee_amount: number;
          return_confirmed_at: string | null;
          return_confirmed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          pickup_location?: string | null;
          return_location?: string | null;
          deposit_amount?: number | null;
          condition_before?: "new" | "like_new" | "good" | "fair" | "poor" | null;
          condition_after?: "new" | "like_new" | "good" | "fair" | "poor" | null;
          actual_return_at?: string | null;
          late_fee_amount?: number;
          return_confirmed_at?: string | null;
          return_confirmed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          pickup_location?: string | null;
          return_location?: string | null;
          deposit_amount?: number | null;
          condition_before?: "new" | "like_new" | "good" | "fair" | "poor" | null;
          condition_after?: "new" | "like_new" | "good" | "fair" | "poor" | null;
          actual_return_at?: string | null;
          late_fee_amount?: number;
          return_confirmed_at?: string | null;
          return_confirmed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      service_jobs: {
        Row: {
          id: string;
          transaction_id: string;
          service_address: string | null;
          scheduled_at: string | null;
          started_at: string | null;
          finished_at: string | null;
          job_status: "scheduled" | "en_route" | "in_progress" | "completed" | "cancelled" | "no_show";
          customer_notes: string | null;
          provider_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          service_address?: string | null;
          scheduled_at?: string | null;
          started_at?: string | null;
          finished_at?: string | null;
          job_status?: "scheduled" | "en_route" | "in_progress" | "completed" | "cancelled" | "no_show";
          customer_notes?: string | null;
          provider_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          service_address?: string | null;
          scheduled_at?: string | null;
          started_at?: string | null;
          finished_at?: string | null;
          job_status?: "scheduled" | "en_route" | "in_progress" | "completed" | "cancelled" | "no_show";
          customer_notes?: string | null;
          provider_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          community_id: string;
          need_id: string | null;
          transaction_id: string | null;
          title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          community_id: string;
          need_id?: string | null;
          transaction_id?: string | null;
          title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          community_id?: string;
          need_id?: string | null;
          transaction_id?: string | null;
          title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversation_participants: {
        Row: {
          id: string;
          conversation_id: string;
          user_id: string;
          last_read_at: string | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          user_id: string;
          last_read_at?: string | null;
          joined_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          user_id?: string;
          last_read_at?: string | null;
          joined_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string | null;
          body: string | null;
          attachment_url: string | null;
          attachment_type: "image" | "file" | "link" | null;
          is_system: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id?: string | null;
          body?: string | null;
          attachment_url?: string | null;
          attachment_type?: "image" | "file" | "link" | null;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string | null;
          body?: string | null;
          attachment_url?: string | null;
          attachment_type?: "image" | "file" | "link" | null;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          transaction_id: string;
          reviewer_id: string;
          reviewee_id: string;
          rating: number;
          comment: string | null;
          role: "requester" | "provider";
          created_at: string;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          reviewer_id: string;
          reviewee_id: string;
          rating: number;
          comment?: string | null;
          role: "requester" | "provider";
          created_at?: string;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          reviewer_id?: string;
          reviewee_id?: string;
          rating?: number;
          comment?: string | null;
          role?: "requester" | "provider";
          created_at?: string;
        };
      };
      disputes: {
        Row: {
          id: string;
          transaction_id: string;
          raised_by: string;
          reason: string;
          description: string | null;
          status: "open" | "under_review" | "resolved" | "closed";
          resolution: string | null;
          resolved_by: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          raised_by: string;
          reason: string;
          description?: string | null;
          status?: "open" | "under_review" | "resolved" | "closed";
          resolution?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          raised_by?: string;
          reason?: string;
          description?: string | null;
          status?: "open" | "under_review" | "resolved" | "closed";
          resolution?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          target_type: "user" | "listing" | "need" | "message";
          target_id: string;
          reason: string;
          description: string | null;
          status: "pending" | "reviewed" | "actioned" | "dismissed";
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          target_type: "user" | "listing" | "need" | "message";
          target_id: string;
          reason: string;
          description?: string | null;
          status?: "pending" | "reviewed" | "actioned" | "dismissed";
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          target_type?: "user" | "listing" | "need" | "message";
          target_id?: string;
          reason?: string;
          description?: string | null;
          status?: "pending" | "reviewed" | "actioned" | "dismissed";
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          transaction_id: string;
          payer_id: string;
          payee_id: string;
          amount: number;
          currency: string;
          method: "cash" | "online" | "deposit" | "platform";
          status: "pending" | "completed" | "failed" | "refunded" | "partially_refunded";
          payment_type: "payment" | "deposit" | "refund" | "fee";
          external_ref: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          payer_id: string;
          payee_id: string;
          amount: number;
          currency?: string;
          method: "cash" | "online" | "deposit" | "platform";
          status?: "pending" | "completed" | "failed" | "refunded" | "partially_refunded";
          payment_type?: "payment" | "deposit" | "refund" | "fee";
          external_ref?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          payer_id?: string;
          payee_id?: string;
          amount?: number;
          currency?: string;
          method?: "cash" | "online" | "deposit" | "platform";
          status?: "pending" | "completed" | "failed" | "refunded" | "partially_refunded";
          payment_type?: "payment" | "deposit" | "refund" | "fee";
          external_ref?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string | null;
          data: Json | null;
          channel: "web" | "email" | "push";
          is_read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body?: string | null;
          data?: Json | null;
          channel?: "web" | "email" | "push";
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          body?: string | null;
          data?: Json | null;
          channel?: "web" | "email" | "push";
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
      };
      saved_listings: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          listing_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          listing_id?: string;
          created_at?: string;
        };
      };
      saved_needs: {
        Row: {
          id: string;
          user_id: string;
          need_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          need_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          need_id?: string;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          target_type: string | null;
          target_id: string | null;
          metadata: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          target_type?: string | null;
          target_id?: string | null;
          metadata?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          target_type?: string | null;
          target_id?: string | null;
          metadata?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
      };
    };
    Functions: {
      accept_offer: {
        Args: {
          p_offer_id: string;
          p_requester_id: string;
        };
        Returns: string;
      };
      is_community_member: {
        Args: {
          p_community_id: string;
          p_user_id: string;
        };
        Returns: boolean;
      };
      get_community_role: {
        Args: {
          p_community_id: string;
          p_user_id: string;
        };
        Returns: string;
      };
    };
  };
};
