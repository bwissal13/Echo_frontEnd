@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_refresh_token_user"))
@OnDelete(action = OnDeleteAction.CASCADE) 